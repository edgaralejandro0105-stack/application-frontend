# Informe Técnico: Cambios Aplicados Durante el Día

Este documento detalla todas las implementaciones técnicas realizadas a lo largo del día de hoy en La Casona, abarcando tanto el rediseño del flujo de acceso del cliente como la implementación del módulo de papelera de reciclaje global.

---

## PARTE 1: Rediseño del Acceso VIP (Portal del Cliente)

### 1. Reestructuración de la Interfaz (Frontend)
- **Eliminación de Elementos Obsoletos**: Se eliminó el formulario de inicio de sesión aislado que se encontraba flotando en la sección del *footer*.
- **Integración Contextual**: El login ahora se encuentra incrustado dentro del componente principal del **Planificador**. Se puede acceder a él de dos formas: mediante el botón "Consulta tu reserva aquí" en la barra de navegación, o cambiando a la pestaña "Consulta tu Reserva" directamente en la UI.
- **Glassmorphism y Animaciones**: El formulario de acceso heredó los tokens de diseño (bordes de cristal, *backdrop-blur* intenso, esferas brillantes de fondo) del componente planificador. Se añadieron transiciones suaves con Framer Motion para alternar entre el agendamiento y el login.

### 2. Lógica de Autenticación
- **Validación de Reglas de Negocio**: Se implementó una lógica temporal para validar contraseñas basada en el formato requerido: **Inicial Mayúscula + Cédula** (Ejemplo: `J12345678`).
- Si el usuario ingresa un formato inválido, el sistema bloquea el acceso mostrando una animación de alerta en color rojo. Si es exitoso, se simula una carga (`loader`) y redirige a la ruta protegida `/portal`.

---

## PARTE 2: Implementación de la Papelera Global (Soft Delete)

## Resumen Ejecutivo
Se ha implementado un sistema global de Papelera de Reciclaje a través del patrón **Soft Delete** (eliminación lógica) para las principales entidades de La Casona (Clientes, Eventos, Empleados, Productos y Proveedores). Esto permite que los elementos eliminados no se borren directamente de la base de datos, sino que queden inactivos durante 30 días, permitiendo su restauración. Pasado este tiempo, un proceso automatizado (Cron Job) purga los datos permanentemente.

---

## 1. Cambios en la Capa de Datos (Base de Datos PostgreSQL)

Se ejecutaron scripts de alteración de tablas (mediante DDL manual en Sequelize) para agregar las siguientes dos columnas a las tablas `clients`, `events`, `employees`, `products` y `providers`:
- `deleted_at`: Tipo `TIMESTAMP`, almacena la fecha y hora exacta en la que un elemento fue movido a la papelera. Es `null` por defecto.
- `is_active`: Tipo `BOOLEAN`, indica si el registro está activo. Por defecto es `true`.

---

## 2. Cambios en la Capa del Modelo (Backend)

### Archivos Modificados:
- `src/models/Client.model.js`
- `src/models/Event.model.js`
- `src/models/Employee.model.js`
- `src/models/Product.model.js`
- `src/models/Provider.model.js`

### Detalles Técnicos:
- Se activó la propiedad `paranoid: true` de Sequelize en la definición de los modelos (donde aplicaba). Esta funcionalidad intercepta automáticamente las consultas `destroy()` transformándolas en `UPDATE deleted_at = NOW()` y excluye los elementos con `deleted_at != null` de los `findAll()` convencionales.
- Para los modelos gestionados manualmente, se reestructuraron las queries para filtrar por `is_active: true` de forma predeterminada.

---

## 3. Cambios en la Capa de Servicios y Controladores (Backend)

### Servicios Modificados (`src/services/`):
- Se actualizó la lógica en `client.service.js`, `event.service.js`, `employee.service.js`, `product.service.js` y `provider.service.js`.
- Se modificaron los métodos `getAll()` para recibir un parámetro opcional `query.deleted = 'true'`. Si está presente, el servicio consulta la base de datos solicitando explícitamente los registros inactivos (usando `where: { is_active: false }` o el equivalente en Sequelize).
- Se implementó un nuevo método asíncrono `restore(id)` en cada servicio. Este método busca el registro inactivo y realiza un `UPDATE` seteando `is_active = true` y `deleted_at = null`.

### Controladores y Rutas Modificados (`src/controllers/` y `src/routes/`):
- Los métodos `delete` de los controladores ahora devuelven un mensaje *"Movido a la papelera"* en lugar de *"Eliminado"*.
- Se añadieron nuevos endpoints `PUT /api/<modulo>/:id/restore` en todos los enrutadores que hacen el puente hacia los métodos `restore()` de los servicios.

### Purga Automática (`src/services/cron.service.js`):
- Se amplió la tarea programada (`cron.schedule`) que se ejecuta todos los días a las 2:00 AM (`'0 2 * * *'`).
- La tarea calcula la fecha correspondiente a hace 30 días (`[Op.lt]: thirtyDaysAgo`).
- Se añadieron las consultas destructivas reales (`Model.destroy({ where: { ... }, force: true })`) para eliminar definitivamente de la base de datos aquellos registros de Clientes, Eventos, Empleados, Productos y Proveedores cuyo tiempo en la papelera haya superado el límite.

---

## 4. Cambios en la Capa del Cliente (Frontend)

### Servicios HTTP (`lib/services/`):
Se actualizaron todos los servicios de conexión con la API para adjuntar el parámetro `?deleted=true` cuando se solicite leer la papelera, e integraron la llamada al método de restauración:
- `client.service.js`
- `event.service.js`
- `employee.service.js`
- `product.service.js`
- `provider.service.js`

### Vistas y Manejo de Interfaz Gráfica (`components/views/`):
- **Mensajes de Advertencia:** En las vistas principales (`crm-view.jsx`, `events-view.jsx`, `hr-view.jsx`, `inventory-view.jsx`, `providers-view.jsx`), se reestructuró el mensaje de eliminación para las alertas del sistema (o los modales emergentes) indicándole al usuario de forma clara: *"Estás a punto de mover a la papelera a [Elemento]. Podrás restaurarlo durante los próximos 30 días"*.
- **`trash-view.jsx` (Central de Papelera):**
  - Se reescribió y refactorizó el componente.
  - Pasó de tener 3 pestañas estáticas a **8 pestañas dinámicas**, incorporando estados (`useState`) y llamadas asíncronas (`useEffect`) independientes para cargar la papelera de Usuarios, Clientes, Eventos, Empleados, Productos, Proveedores, Salones y Servicios Externos.
  - Se unificó la lógica del renderizado de la tabla de datos, inyectando de manera condicional el nombre, detalles y la acción de restaurar (`handleRestore`) específica para cada entidad y cada fila de la tabla.

---

## Conclusión Técnica
La arquitectura de la aplicación es ahora más segura contra el error humano. La base de datos mantiene su integridad relacional gracias a que las foreign keys no se rompen de forma accidental por eliminaciones apresuradas, protegiendo así los registros históricos de ventas y reportes contables vinculados a dichas entidades.

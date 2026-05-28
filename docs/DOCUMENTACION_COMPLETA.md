# Documentación General e Integración Técnica - Frontend La Casona

Este documento consolida toda la documentación del Frontend de **La Casona** en un único informe técnico. Está diseñado para servir como guía de estudio completa para la defensa del proyecto, detallando la arquitectura, la guía de desarrollo, la integración con la API REST y las decisiones de diseño de software adoptadas.

---

## ÍNDICE DE CONTENIDOS

1.  **Descripción General y Stack Tecnológico**
2.  **Guía de Instalación y Arranque del Entorno**
3.  **Estructura y Justificación del Proyecto**
4.  **Arquitectura del Sistema (Ruteo, Estado y Temas)**
5.  **Capa de Datos: Cliente HTTP y Arquitectura Fetch**
6.  **Mapeo de Servicios y Endpoints del Backend**
7.  **Patrones de Integración y Código de Ejemplo**
8.  **Gestión y Captura de Errores**
9.  **Historial de Refactorizaciones Clave**

---

## 1. DESCRIPCIÓN GENERAL Y STACK TECNOLÓGICO

El Frontend de **La Casona** es una aplicación SPA (Single Page Application) responsiva que sirve como panel de control administrativo integral. Está diseñado para centralizar y automatizar los módulos operativos de la empresa: gestión de eventos y salones, CRM de clientes, inventarios de cocina y bar, ventas, proveedores y recursos humanos.

La aplicación fue desarrollada buscando el máximo rendimiento, modularidad y legibilidad. Para lograr esto, se purgaron todas las dependencias y hojas de estilo heredadas de plantillas antiguas (como CoreUI y Bootstrap), logrando una base de código moderna con los siguientes componentes tecnológicos:

### Stack de Tecnologías Principal

*   **React 19.2.3**: Biblioteca principal de interfaz de usuario. Se utiliza un enfoque basado al 100% en componentes funcionales y React Hooks para el control del ciclo de vida y los estados.
*   **Vite 8.0.14**: Herramienta de compilación y servidor de desarrollo. Reemplaza a empaquetadores más lentos como Webpack, proporcionando arranque instantáneo y Hot Module Replacement (HMR) ultrarrápido.
*   **React Router DOM v7 (7.15.1)**: Enrutador del lado del cliente que permite transiciones instantáneas entre páginas sin recargar el navegador, emulando la fluidez de una aplicación nativa.
*   **Tailwind CSS v4**: Motor y framework de estilos utilitarios de última generación. Permite diseñar interfaces modernas directamente sobre las clases del HTML, reduciendo el peso de las hojas de estilo y facilitando la consistencia visual.
*   **Radix UI + Shadcn UI**: Primitivas de componentes sin estilos que garantizan la accesibilidad web. Sobre estas se construye el sistema de componentes personalizados del proyecto (botones, modales, alertas, dropdowns, tablas).
*   **Lucide React**: Librería de iconos vectoriales modernos de alta resolución y bajo peso.
*   **Next Themes**: Proveedor de control de modo claro y oscuro a nivel de documento.
*   **React Hook Form + Zod**: Solución integrada para la gestión de formularios dinámicos y validaciones estrictas del lado del cliente.

---

## 2. GUÍA DE INSTALACIÓN Y ARRANQUE DEL ENTORNO

### Requisitos del Sistema
*   **Node.js**: Versión 18.0 o superior (Recomendado v20.x LTS)
*   **NPM**: Gestor de paquetes oficial de Node.

### Pasos para Configurar y Ejecutar Localmente

1.  **Acceder al directorio del frontend:**
    ```bash
    cd "Frontend Casona"
    ```
2.  **Instalar las dependencias de desarrollo y producción:**
    ```bash
    npm install
    ```
3.  **Configurar las variables de entorno:**
    Crea un archivo llamado `.env.local` en la raíz del directorio frontend para configurar la comunicación con el backend:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```
4.  **Iniciar el servidor de desarrollo local:**
    ```bash
    npm run dev
    ```
    El servidor arrancará en el puerto **3001** (definido en `vite.config.js`). Abre en tu navegador la dirección `http://localhost:3001`.

### Comandos de Terminal Disponibles
*   `npm run dev`: Levanta el servidor local con Hot Module Replacement (HMR).
*   `npm run build`: Ejecuta un proceso de optimización que realiza *tree-shaking* (eliminación de código muerto), compresión de recursos y empaquetamiento final en código estático optimizado dentro de la carpeta `/dist`.
*   `npm run start`: Inicia un servidor local de vista previa para probar los archivos compilados de producción antes de desplegar.

---

## 3. ESTRUCTURA Y JUSTIFICACIÓN DEL PROYECTO

La organización de archivos del proyecto se estructuró con base en el patrón de **Separación de Responsabilidades (Separation of Concerns)**. Esto evita el código espagueti al asegurar que el diseño visual, la lógica de negocios y la comunicación de red no se mezclen en los mismos archivos.

### Vista del Árbol del Proyecto
```
Frontend Casona/
├── components/                  # Componentes reutilizables de UI y Negocio
│   ├── auth/                    # Vistas y componentes del flujo de Auth
│   │   ├── Login.jsx            # Pantalla de inicio de sesión
│   │   ├── ForgotPassword.jsx   # Formulario de recuperación de clave
│   │   ├── Profile.jsx          # Panel de perfil de usuario
│   │   └── ProtectedRoute.jsx   # Guarda de ruta basada en sesión activa
│   ├── ui/                      # Componentes base de diseño (Shadcn UI)
│   │   ├── button.jsx, input.jsx, dialog.jsx, card.jsx, etc.
│   │   └── use-toast.js         # API para lanzar notificaciones toast
│   ├── views/                   # Vistas principales de negocio (Módulos)
│   │   ├── dashboard-view.jsx   # Dashboard ejecutivo
│   │   ├── crm-view.jsx         # Gestión de clientes
│   │   ├── events-view.jsx      # Gestión de eventos y salones
│   │   ├── inventory-view.jsx   # Control de almacén
│   │   ├── hr-view.jsx          # Gestión de personal / RRHH
│   │   └── ...                  # Ventas y Proveedores
│   ├── sidebar.jsx              # Menú lateral interactivo
│   ├── theme-provider.jsx       # Wrapper para el color del tema
│   └── theme-toggle.jsx         # Botón para cambiar Modo Claro/Oscuro
│
├── context/                     # Estados globales compartidos
│   └── AuthContext.jsx          # Contexto de autenticación del usuario
│
├── lib/                         # Clientes y utilidades
│   ├── api-client.js            # Cliente HTTP centralizado (fetch wrapper)
│   ├── utils.js                 # Utilidades (cn para combinar clases de CSS)
│   └── services/                # Servicios específicos de consumo de endpoints
│       ├── auth.service.js      # Peticiones de login, perfil y contraseña
│       ├── client.service.js    # CRUD de clientes
│       ├── event.service.js     # CRUD de eventos
│       └── ...                  # Inventario, personal y ventas
│
├── public/                      # Recursos estáticos (logos, favicons, etc.)
├── src/                         # Archivos base de la aplicación React
│   ├── AppRouter.jsx            # Enrutamiento de la aplicación
│   ├── main.jsx                 # Punto de entrada de React
│   └── globals.css              # Estilos globales y variables de Tailwind
│
├── .editorconfig                # Consistencia de formato en editores de código
├── .env.local                   # Variables de entorno locales (URL de API)
├── .gitignore                   # Archivos excluidos del control de versiones
├── .prettierrc.js               # Configuración de formateo automático de Prettier
├── components.json              # Configuración e integración de Shadcn UI
├── eslint.config.mjs            # Reglas de análisis de calidad y linter de ESLint
├── index.html                   # Plantilla HTML raíz para el montaje de React
├── package.json                 # Dependencias del proyecto y scripts de ejecución
├── postcss.config.mjs           # Procesamiento de Tailwind para compatibilidad CSS
└── vite.config.js               # Configuración del servidor y empaquetador Vite
```

### Justificación de la Estructura

*   **Desacoplamiento Visual (`components/ui`)**: Los elementos gráficos base como botones o diálogos son agnósticos a la lógica de negocios. No saben de endpoints ni de base de datos; solo responden a los datos y eventos que se les inyectan por props. Esto permite rediseñar la interfaz completa del proyecto sin alterar el funcionamiento del software.
*   **Aislamiento de la API (`lib/services`)**: Los componentes visuales de las pantallas (como `inventory-view.jsx`) nunca consumen directamente URLs del backend ni manejan la autenticación. Consumen los servicios (como `inventoryService.getAll()`). Si el servidor cambia de dirección, de puerto o renombra un endpoint en la base de datos, solo se debe actualizar el archivo del servicio correspondiente en el frontend; la interfaz visual seguirá operando de manera idéntica sin enterarse del cambio técnico.

---

## 4. ARQUITECTURA DEL SISTEMA (RUTEO, ESTADO Y TEMAS)

### Sistema de Ruteo SPA (`AppRouter.jsx`)
El sistema utiliza el ruteador declarativo `BrowserRouter` del cliente. Se divide la navegación en dos áreas con fines de seguridad:

1.  **Rutas Públicas**:
    *   `/login`: Vista de autenticación del usuario.
    *   `/forgot-password`: Flujo de recuperación de clave.
    *   `/reset-password`: Formulario de cambio definitivo de contraseña.
2.  **Rutas Protegidas**:
    *   `/`: Dashboard general donde se montan las vistas dinámicamente mediante el estado de la barra de navegación lateral.
    *   `/profile`: Configuración e información del perfil del usuario logueado.

La protección de las vistas privadas se realiza mediante el componente wrapper **`ProtectedRoute.jsx`**. Este lee el estado de autenticación de la aplicación; si no detecta una sesión válida, bloquea el renderizado y redirige de inmediato a `/login`.

### Manejo de Estado Global (Context API)
Para mantener el frontend veloz y evitar la sobrecarga de dependencias pesadas como Redux, el manejo de sesión se implementó con el **React Context API** mediante **`AuthContext.jsx`**:

*   **`user`**: Objeto con los datos del usuario actual (nombre, correo, rol).
*   **`token`**: JWT de acceso activo.
*   **`isAuthenticated`**: Booleano que define si hay una sesión activa.
*   **`login(token, userData)`**: Almacena el token y los datos del usuario en la memoria del estado y los persiste en el `localStorage` del navegador para evitar que la sesión expire al recargar la página.
*   **`logout()`**: Borra la información de la memoria y limpia el `localStorage`.

### Control de Estilos y Temas Claro/Oscuro
La aplicación utiliza variables CSS nativas inyectadas por **Tailwind CSS v4** y administradas mediante **`next-themes`**.
*   El tema se controla agregando o quitando la clase `.dark` del elemento raíz `<html>`.
*   El componente **`ThemeToggle.jsx`** detecta el tema preferido del sistema operativo del usuario y le permite alternar manualmente entre temas Claro u Oscuro, guardando su preferencia localmente.

---

## 5. CAPA DE DATOS: CLIENTE HTTP Y ARQUITECTURA FETCH

La comunicación con el backend (API REST) se realiza de manera centralizada. En lugar de utilizar librerías de terceros como Axios, el proyecto emplea un envoltorio (*wrapper*) robusto construido sobre la API nativa **`fetch`** de JavaScript, ubicado en **`lib/api-client.js`**.

### Flujo de la Comunicación de Red
El flujo de datos sigue un camino de tres capas desacopladas:
```
Vista Visual (UI) ──► Servicio (Service) ──► Cliente de API (apiClient) ──► Fetch API ──► Servidor Backend
```

### Características del Cliente Centralizado (`apiClient`)
*   **Configuración Única**: Define la URL base de manera dinámica desde las variables de entorno (`import.meta.env.VITE_API_URL`), evitando escribir rutas absolutas en el código.
*   **Interceptación de Seguridad**: El cliente busca automáticamente el token JWT en el `localStorage` del navegador antes de disparar la petición HTTP. Si existe, inyecta la cabecera de seguridad de manera transparente en la solicitud:
    ```http
    Authorization: Bearer <TOKEN>
    ```
*   **Conversión de Datos**: Configura por defecto las cabeceras `Content-Type: application/json` y se encarga de parsear las respuestas que entrega el servidor (`response.json()`).
*   **Manejo Uniforme de Errores**: Si la respuesta del servidor no tiene un código de estado exitoso (2xx), el cliente captura la respuesta, extrae el mensaje de error estructurado del backend y lo propaga para que la interfaz pueda desplegar una notificación toast al usuario.

---

## 6. MAPEO DE SERVICIOS Y ENDPOINTS DEL BACKEND

Cada entidad u operación del backend tiene un archivo de servicio dedicado dentro de `lib/services/`. A continuación se detallan los servicios activos y sus respectivos mapeos con los endpoints de la API:

### 1. Servicio de Autenticación (`auth.service.js`)
Maneja el inicio de sesión, recuperación de contraseña y los datos del usuario en sesión.
*   `login(email, password)` ──► **POST** `/auth/login`
*   `register(name, email, password)` ──► **POST** `/auth/register`
*   `getProfile()` ──► **GET** `/auth/profile`
*   `updateProfile(data)` ──► **PUT** `/auth/profile`
*   `forgotPassword(email)` ──► **POST** `/auth/forgot-password`
*   `resetPassword(token, password)` ──► **POST** `/auth/reset-password`

### 2. Servicio de Clientes / CRM (`client.service.js`)
Administra los registros de los clientes para la cotización y control de eventos.
*   `getAll()` ──► **GET** `/clients`
*   `getById(id)` ──► **GET** `/clients/{id}`
*   `create(data)` ──► **POST** `/clients`
*   `update(id, data)` ──► **PUT** `/clients/{id}`
*   `delete(id)` ──► **DELETE** `/clients/{id}`

### 3. Servicio de Eventos y Salones (`event.service.js`)
Administra los eventos programados en los salones de La Casona.
*   `getAll()` ──► **GET** `/events`
*   `getById(id)` ──► **GET** `/events/{id}`
*   `create(data)` ──► **POST** `/events`
*   `update(id, data)` ──► **PUT** `/events/{id}`
*   `delete(id)` ──► **DELETE** `/events/{id}`
*   `getUpcoming(limit)` ──► **GET** `/events/upcoming?limit={limit}`

### 4. Servicio de Inventario (`inventory.service.js` e `inventorybar.service.js`)
Controla las existencias en almacenes de cocina y barras de bebidas.
*   `getAll()` ──► **GET** `/inventory` (o `/inventorybar`)
*   `getById(id)` ──► **GET** `/inventory/{id}`
*   `create(data)` ──► **POST** `/inventory`
*   `update(id, data)` ──► **PUT** `/inventory/{id}`
*   `delete(id)` ──► **DELETE** `/inventory/{id}`
*   `getLowStock()` ──► **GET** `/inventory/low-stock`

### 5. Servicio de Ventas (`sale.service.js`)
Registra las transacciones e ingresos generados.
*   `getAll()` ──► **GET** `/sales`
*   `create(data)` ──► **POST** `/sales`
*   `getRecent(limit)` ──► **GET** `/sales/recent?limit={limit}`
*   `getTotalRevenue()` ──► **GET** `/sales/revenue`

### 6. Servicio de Recursos Humanos (`employee.service.js`)
Maneja la información del personal contratado.
*   `getAll()` ──► **GET** `/employees`
*   `getById(id)` ──► **GET** `/employees/{id}`
*   `create(data)` ──► **POST** `/employees`
*   `update(id, data)` ──► **PUT** `/employees/{id}`
*   `delete(id)` ──► **DELETE** `/employees/{id}`

---

## 7. PATRONES DE INTEGRACIÓN Y CÓDIGO DE EJEMPLO

A continuación se exponen ejemplos de código en JavaScript limpio que ilustran cómo se implementan los consumos y envíos de datos en las pantallas de la aplicación.

### Patrón 1: Carga y Renderizado de Datos (Ej: Listado de Eventos)
Este patrón utiliza un estado local para almacenar los datos, un estado de carga y un efecto de React (`useEffect`) que invoca al servicio al montarse el componente.

```jsx
import React, { useEffect, useState } from 'react';
import { eventService } from '@/lib/services/event.service';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function ComponenteEventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAll();
        setEvents(data);
      } catch (error) {
        toast({
          title: "Error al cargar eventos",
          description: error.message || "No se pudo conectar con el servidor.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [toast]);

  if (loading) return <div className="text-center py-4">Cargando eventos...</div>;

  return (
    <div className="grid gap-4">
      {events.map((evento) => (
        <Card key={evento.id}>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg">{evento.name}</h3>
            <p className="text-muted-foreground text-sm">Fecha: {evento.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Patrón 2: Envío de Formularios (Ej: Creación de Cliente)
Combina `react-hook-form` para gestionar el estado de los campos de entrada y `zod` para validar la información antes de enviarla mediante el método `POST` de la API.

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clientService } from '@/lib/services/client.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// Esquema de validación estricta con Zod
const clientSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
  phone: z.string().min(7, "Número telefónico no válido")
});

export function FormularioCliente({ onSuccess }) {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clientSchema)
  });

  const enviarFormulario = async (datos) => {
    try {
      await clientService.create(datos);
      toast({
        title: "Éxito",
        description: "El cliente ha sido registrado correctamente."
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el cliente.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nombre Completo</label>
        <Input {...register("name")} placeholder="Ej: Juan Pérez" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div>
        <label className="text-sm font-medium">Correo Electrónico</label>
        <Input type="email" {...register("email")} placeholder="ejemplo@correo.com" />
        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
      </div>

      <div>
        <label className="text-sm font-medium">Teléfono de Contacto</label>
        <Input {...register("phone")} placeholder="Ej: +56912345678" />
        {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Registrando..." : "Crear Cliente"}
      </Button>
    </form>
  );
}
```

---

## 8. GESTIÓN Y CAPTURA DE ERRORES

La consistencia en el manejo de errores garantiza que la aplicación no sufra caídas inesperadas (pantallas en blanco) y que el usuario o evaluador comprenda qué falló en la comunicación.

### Captura de Errores HTTP del Servidor
Cuando la API devuelve un código de error, el cliente `apiClient` arroja un error con la estructura enviada por el backend. Los códigos HTTP típicos y su flujo de control en la aplicación son:

*   **`400 Bad Request` (Solicitud Inválida)**: Ocurre cuando fallan las validaciones del backend. El sistema atrapa el error y mapea los detalles directamente a los campos del formulario correspondientes.
*   **`401 Unauthorized` (No Autorizado)**: Indica que el token de sesión expiró o es inválido. El manejador de errores ejecuta de inmediato la función de `logout()` del Contexto de Autenticación, eliminando la información almacenada localmente y redirigiendo al usuario de regreso a la pantalla de `/login`.
*   **`403 Forbidden` (Acceso Prohibido)**: El rol del usuario no tiene permisos suficientes para ver la sección. El sistema muestra un mensaje toast de "Acceso denegado".
*   **`404 Not Found` (No Encontrado)**: El recurso solicitado no existe. La aplicación muestra una pantalla de estado vacío (*Empty State*).
*   **`500 Internal Server Error` (Error de Servidor)**: El servidor tiene problemas internos. La aplicación muestra un aviso general sugiriendo intentar más tarde.

---

## 9. HISTORIAL DE REFACTORIZACIONES CLAVE

Para la defensa del proyecto, es fundamental justificar los cambios técnicos realizados sobre la base del proyecto anterior, demostrando iniciativa de optimización técnica:

### 1. Migración a Vite SPA (Desde Next.js / TypeScript)
*   **Motivo**: El proyecto original utilizaba Next.js basado en renderizado de lado de servidor (SSR). Esto sobrecargaba la velocidad de carga local y requería configuraciones complejas para despliegues estáticos. Adicionalmente, el tipado de TypeScript agregaba complejidad al código para un desarrollo ágil de un prototipo administrativo.
*   **Solución**: Se migró a una arquitectura SPA (Single Page Application) pura con **Vite**. Se transpilaron los archivos de TypeScript (`.ts`/`.tsx`) a JavaScript estándar (`.js`/`.jsx`) eliminando los archivos pesados de configuración como `tsconfig.json`. La velocidad de compilación mejoró drásticamente de minutos a escasos **1.04 segundos**.

### 2. Purga y Reemplazo del Template de CoreUI
*   **Motivo**: La plantilla original de CoreUI venía cargada con Bootstrap 5, Redux, y múltiples paquetes SCSS obsoletos. Esto generaba un diseño genérico, hojas de estilo que chocaban con Tailwind CSS, dependencias de diseño pesadas que daban errores de consola, y un flujo confuso de control de estados globales.
*   **Solución**: Se desinstalaron todos los paquetes asociados a `@coreui/*`, Bootstrap y Redux. Se eliminó la carpeta de estilos SCSS y la configuración del Redux Store. En su lugar, se rediseñó la aplicación completa utilizando **Tailwind CSS v4** y componentes dinámicos de **Shadcn UI** controlados con la API de contexto de React. Esto aligeró el peso de la compilación y dotó a la plataforma de una estética premium y consistente de modo oscuro y Glassmorphism.

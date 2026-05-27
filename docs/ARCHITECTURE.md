# La Casona - Arquitectura del Frontend

Este documento proporciona una visión general y detallada de la arquitectura, patrones de diseño e implementación técnica del panel de administración (Frontend) de **La Casona**.

---

## Índice

- [Resumen del Proyecto](#resumen-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Patrón Arquitectónico](#patrón-arquitectónico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Sistema de Ruteo](#sistema-de-ruteo)
- [Manejo de Estado (State Management)](#manejo-de-estado-state-management)
- [Estilos y Temas](#estilos-y-temas)
- [Compilación y Construcción](#compilación-y-construcción)

---

## Resumen del Proyecto

El Frontend de **La Casona** es una aplicación SPA (Single Page Application) moderna diseñada para centralizar la gestión de eventos, CRM de clientes, control de inventario de cocina y bar, ventas y recursos humanos.

El proyecto fue completamente migrado de una plantilla pesada heredada (CoreUI + Bootstrap + Redux) hacia una base moderna construida desde cero con **React 19, Vite, Tailwind CSS v4 y componentes Shadcn UI**, logrando un diseño extremadamente premium, modular, ligero y de alto rendimiento.

---

## Stack Tecnológico

### Núcleo Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.3 | Biblioteca UI basada en componentes funcionales y Hooks. |
| **Vite** | 8.0.14 | Empaquetador y servidor de desarrollo ultrarrápido con HMR. |
| **React Router DOM** | 7.15.1 | Ruteo declarativo del lado del cliente. |

### Interfaz de Usuario (UI) y Diseño

| Librería | Propósito |
|----------|-----------|
| **Tailwind CSS v4** | Framework CSS utilitario y moderno. |
| **Radix UI** | Primitivas accesibles y sin estilos para el núcleo de los componentes. |
| **Shadcn UI** | Sistema de diseño de componentes listos para usar y altamente personalizables. |
| **Lucide React** | Librería de iconos vectoriales modernos y ligeros. |
| **Next Themes** | Proveedor de temas (Claro / Oscuro) con soporte de persistencia local. |

### Formularios y Validación

| Librería | Propósito |
|----------|-----------|
| **React Hook Form** | Manejo optimizado y de alto rendimiento de formularios. |
| **Zod** | Validación robusta de esquemas de datos. |

---

## Patrón Arquitectónico

La aplicación sigue una **arquitectura basada en componentes funcionales** y división de responsabilidades (*Separation of Concerns*):

```
┌──────────────────────────────────────────────┐
│            Entrypoint (main.jsx)             │
│  - Inicializa Proveedor de Temas            │
│  - Inicializa Proveedor de Autenticación    │
│  - Renderiza AppRouter                       │
└──────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│           Ruteador (AppRouter.jsx)           │
│  - Enrutamiento principal (BrowserRouter)    │
│  - Rutas Públicas (Login, Forgot, Reset)     │
│  - Rutas Protegidas (Home/Dashboard, Perfil) │
└──────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│               Layout (Home.jsx)              │
│  - Sidebar de Navegación Lateral             │
│  - Barra superior de Usuario (Header)        │
│  - Renderizado dinámico de Vistas de negocio │
└──────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

El código está organizado para promover la modularidad y reutilización:

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

### Archivos de Configuración (Raíz)

Para la defensa del proyecto, es importante comprender la función de los archivos de configuración ubicados en la raíz:

*   **`package.json`**: Contiene la configuración administrativa del proyecto, los scripts ejecutables (`npm run dev`, `npm run build`) y el listado de dependencias requeridas (React, Shadcn UI, Tailwind, etc.).
*   **`package-lock.json`**: Registra las versiones exactas instaladas de cada dependencia y sus subdependencias, garantizando la consistencia del entorno de ejecución al reinstalar en cualquier equipo.
*   **`vite.config.js`**: Controla el funcionamiento de Vite. Configura el servidor de desarrollo en el puerto 3001, inyecta el soporte de React y define el alias `@` para facilitar las importaciones relativas desde la raíz.
*   **`index.html`**: Es el archivo HTML principal de la Single Page Application (SPA). Contiene el nodo contenedor `<div id="root">` donde React monta toda la aplicación.
*   **`components.json`**: Guarda las preferencias del CLI de Shadcn UI, tales como los alias de importación, el color base, la configuración de variables CSS y el framework de estilos asociados.
*   **`postcss.config.mjs`**: Configura PostCSS, necesario para que Tailwind CSS compile sus clases utilitarias de manera óptima y compatible con navegadores antiguos y modernos.
*   **`.env.local`**: Almacena las variables de entorno de uso local (como `VITE_API_URL`), evitando hardcodear URLs en el código fuente de los servicios.
*   **`.gitignore`**: Le indica a Git qué archivos no se deben subir al repositorio de código (como `node_modules` o archivos `.env` con credenciales de desarrollo).
*   **`eslint.config.mjs`**: Reglas de ESLint para asegurar la calidad de código JavaScript, previniendo errores de sintaxis o malas prácticas.
*   **`.prettierrc.js` y `.prettierignore`**: Configuración de Prettier para formatear automáticamente el código con criterios estandarizados (comillas simples, eliminación de puntos y comas opcionales, etc.).
*   **`.editorconfig`**: Asegura que diferentes editores de código mantengan la misma indentación (2 espacios) y saltos de línea al editar.


---

## Sistema de Ruteo

### React Router DOM v7

El enrutamiento principal utiliza el navegador (`BrowserRouter`) del lado del cliente.
Se divide en dos categorías lógicas:

1. **Rutas Públicas**:
   * `/login`: Acceso al sistema.
   * `/forgot-password`: Petición de enlace de recuperación.
   * `/reset-password`: Restablecimiento de contraseña nueva.
2. **Rutas Protegidas**:
   * `/`: Pantalla principal del Dashboard.
   * `/profile`: Visualización y actualización del perfil del usuario.

Las rutas protegidas se envuelven en el componente `<ProtectedRoute>`, el cual verifica si existe una sesión activa y un token JWT válido. Si no lo hay, redirige inmediatamente a `/login`.

---

## Manejo de Estado (State Management)

### React Context API

Para mantener la aplicación ligera y rápida, se eliminó por completo Redux. En su lugar, el estado global se administra mediante la API nativa de React:

*   **`AuthContext.jsx`**: Centraliza los datos del usuario logueado (`user`), el token JWT (`token`), y el estado general (`isAuthenticated`). Expone los métodos `login`, `logout` y la función para actualizar datos del perfil, persistiendo el token automáticamente en el `localStorage` del navegador para mantener la sesión activa entre recargas de página.
*   **Estado Local (`useState`)**: Para vistas dinámicas e interacciones internas del usuario (como cambiar la pestaña activa del sidebar o desplegar modales).

---

## Estilos y Temas

### Tailwind CSS v4

La aplicación se apoya en **Tailwind CSS v4**, configurado en `src/globals.css`. Esta versión moderna permite un procesamiento más rápido mediante variables de CSS nativas:

*   **Paleta de colores**: Diseñada con colores neutros y acentos que brindan una interfaz limpia estilo Glassmorphism y Dark Mode.
*   **Temas Claro / Oscuro**: Gestionado de manera nativa por `next-themes` y el componente `ThemeToggle`, aplicando la clase `dark` al elemento `<html>`.

---

## Compilación y Construcción

Vite gestiona el ciclo de desarrollo y producción:

*   **Desarrollo**: `npm run dev` levanta un servidor local en el puerto **3001** con recarga en caliente instantánea (HMR).
*   **Producción**: `npm run build` realiza un análisis estático de código, remueve dependencias no usadas (*tree-shaking*), optimiza los assets y empaqueta el frontend en archivos HTML/JS/CSS estáticos optimizados en el directorio `dist/`.

---

## Justificación de la Estructura (Arquitectura y Diseño)

La estructuración del directorio raíz y las carpetas internas responde a patrones de diseño de software consagrados, enfocados en la **mantenibilidad, escalabilidad y la separación de responsabilidades (Separation of Concerns)**:

### 1. Separación de Responsabilidades
*   **Presentación Visual (`components/ui`)**: Son componentes puros de diseño (botones, inputs, diálogos, tablas). No saben nada de lógica de negocios ni de peticiones HTTP. Solo reciben props y renderizan UI.
*   **Vistas de Negocio (`components/views`)**: Son los paneles principales de cada módulo de la empresa. Orquestan la interacción del usuario y consumen los servicios para obtener y enviar datos.
*   **Control del Estado de Sesión (`context/`)**: Centraliza los estados globales transversales (si el usuario está logueado o no) para evitar el acoplamiento directo entre componentes distantes.
*   **Capa de Datos e HTTP (`lib/` y `lib/services/`)**: Centraliza el comportamiento de la red, endpoints y llamadas al backend.

### 2. Desacoplamiento de la Interfaz
Con esta estructura, si el backend cambia un endpoint, una ruta de API o el formato en que envía los datos de un cliente, **solo** se modifica el archivo correspondiente en `lib/services/client.service.js`. Las pantallas visuales no se enteran de este cambio técnico, ya que solo llaman a `clientService.getAll()` y reciben el arreglo de datos listo para renderizar.

---

## Arquitectura de Conexión a la API y Uso de Fetch

Para la comunicación de datos con el Backend, el sistema implementa un **Patrón de Servicio Centralizado** apoyado en el API nativo `fetch` de JavaScript.

### ¿Cómo funciona el flujo de datos?

El flujo sigue un camino de tres capas para evitar la redundancia y asegurar la modularidad:

```
Componente Visual (UI) ──► Servicio (Service) ──► Cliente Centralizado (apiClient) ──► Fetch API ──► Backend
```

1.  **Componente UI (Ej: `events-view.jsx`)**: El componente visual no conoce URLs ni tokens de seguridad. Solo llama a una función asíncrona limpia:
    ```javascript
    const datos = await eventService.getAll();
    ```
2.  **Servicio (`lib/services/event.service.js`)**: El servicio encapsula las operaciones específicas del módulo. Conoce el endpoint exacto del servidor backend, pero delega la petición HTTP real al cliente de API común:
    ```javascript
    export const eventService = {
      getAll: () => apiClient.get("/events")
    };
    ```
3.  **Cliente Centralizado (`lib/api-client.js`)**: Es la pieza clave de red. Es un envoltorio (*wrapper*) construido sobre la función nativa `fetch` de JavaScript. Resuelve los siguientes aspectos de manera automática:
    *   **Inyección de la URL Base**: Lee `VITE_API_URL` del entorno para no repetir la dirección del servidor en cada petición.
    *   **Manejo de Seguridad (Token JWT)**: Intercepta cada solicitud de salida y le adjunta de manera automática la cabecera:
        ```http
        Authorization: Bearer <TOKEN_DE_SESION>
        ```
        obteniendo el token directamente de `localStorage`.
    *   **Configuración Común**: Configura de forma transparente las cabeceras `Content-Type: application/json` y procesa las respuestas del servidor convirtiéndolas de JSON a objetos legibles o capturando y formateando errores HTTP (como 401 No Autorizado, 400 Petición Inválida, 500 Error de Servidor) de manera uniforme para mostrárselos al usuario final mediante alertas visuales (Toasts).


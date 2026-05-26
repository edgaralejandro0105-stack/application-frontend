# Frontend - La Casona

Plataforma web de administración integral para la gestión de eventos, clientes, inventario, ventas y recursos humanos de La Casona.

## 📋 Descripción del Proyecto

**La Casona Frontend** es una aplicación web SPA (Single Page Application) moderna construida con tecnologías de punta para proporcionar una interfaz intuitiva y responsiva para la gestión completa de operaciones empresariales. La aplicación soporta autenticación basada en tokens JWT y cuenta con módulos especializados para diferentes áreas operativas.

### Versión

- **Versión Actual:** 0.1.0
- **Estado:** En desarrollo
- **Última Actualización:** Mayo 2026

---

## 🏗️ Stack Tecnológico

| Tecnología          | Propósito                          |
| ------------------- | ---------------------------------- |
| **Vite**            | Empaquetador ultrarrápido y Dev Server |
| **React**           | Biblioteca para UI                 |
| **React Router**    | Enrutamiento cliente (SPA)         |
| **JavaScript**      | Lenguaje principal (.js / .jsx)    |
| **Tailwind CSS**    | Framework de estilos utilitarios   |
| **Radix UI**        | Componentes accesibles sin estilos |
| **React Hook Form** | Gestión de formularios             |
| **Zod**             | Validación de esquemas             |
| **Lucide React**    | Iconografía elegante y escalable   |

---

## 📁 Estructura del Proyecto

```
Frontend Casona/
├── src/                          # Código fuente principal
│   ├── main.jsx                 # Punto de entrada de la aplicación
│   ├── AppRouter.jsx            # Configuración de React Router
│   ├── index.css                # Estilos globales de Tailwind
│   └── globals.css              # Variables CSS
├── components/
│   ├── ui/                      # Componentes UI base reutilizables
│   ├── views/                   # Vistas principales de negocio
│   │   ├── dashboard-view.jsx   # Dashboard ejecutivo
│   │   ├── events-view.jsx      # Gestión de eventos
│   │   ├── crm-view.jsx         # Gestión de clientes
│   │   ├── inventory-view.jsx   # Control de inventario
│   │   └── ...                  # Otras vistas
│   ├── auth/                    # Componentes de Autenticación
│   │   ├── Login.jsx            # Pantalla de Login Enterprise UI/UX
│   │   ├── Profile.jsx          # Vista de perfil del usuario
│   │   └── ProtectedRoute.jsx   # Wrapper de seguridad
│   └── sidebar.jsx              # Barra lateral de navegación principal
├── context/
│   └── AuthContext.jsx          # Contexto global de estado de autenticación
├── lib/
│   ├── api-client.js            # Cliente HTTP centralizado (fetch API)
│   ├── utils.js                 # Funciones utilitarias (clsx, tailwind-merge)
│   └── services/                # Servicios de interacción con el backend
│       ├── auth.service.js      # Autenticación y Perfil
│       ├── client.service.js    # Gestión de clientes
│       ├── event.service.js     # Gestión de eventos
│       └── ...                  # Otros servicios
├── public/
│   ├── logo.jpeg                # Favicon / Logo de la empresa
│   ├── image1.png               # Asset decorativo (Ej: Login)
│   └── ...                      # Otros assets estáticos
├── index.html                   # Plantilla HTML raíz
├── vite.config.js               # Configuración de Vite
├── tailwind.config.js           # Configuración de Tailwind CSS
├── package.json                 # Dependencias y scripts
└── .env.local                   # Variables de entorno (no versionado)
```

---

## ⚙️ Requisitos Previos

- **Node.js:** v18.17.0 o superior
- **NPM / pnpm:** Gestor de paquetes
- **Backend:** Debe estar ejecutándose en `http://localhost:3000`

---

## 🚀 Guía de Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd "Frontend Casona"
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en tu navegador y Vite proporcionará la URL local (usualmente `http://localhost:5173` o el puerto que asigne).

---

## 📦 Scripts Disponibles

| Script         | Comando        | Descripción                                  |
| -------------- | -------------- | -------------------------------------------- |
| **Desarrollo** | `npm run dev`  | Inicia servidor Vite con hot-reload (HMR)    |
| **Build**      | `npm run build`| Compila y minifica para producción           |
| **Producción** | `npm run start`| Inicia servidor de preview para testear build|

---

## 🔐 Autenticación y Seguridad

La aplicación implementa un sistema robusto de autenticación:

- **Vista Enterprise Login:** Componente `Login.jsx` moderno de tipo "Split Screen" con validación avanzada lado-cliente vía `react-hook-form` y `Zod`.
- **JWT (JSON Web Tokens):** Las peticiones a la API adjuntan automáticamente el token almacenado.
- **Rutas Protegidas:** Implementadas a través del componente `ProtectedRoute.jsx` que evalúa el `AuthContext`.

Ver [docs/CHANGELOG_FRONTEND_AUTH.md](docs/CHANGELOG_FRONTEND_AUTH.md) para más detalles.

---

## 📡 Integración con Backend

La comunicación con el backend se realiza a través de un cliente HTTP centralizado:

- **Cliente:** [lib/api-client.js](lib/api-client.js)
- **Servicios:** [lib/services/](lib/services/)

---

## 🛠️ Desarrollo de Componentes

### Estándares de Código

- **Lenguaje:** JavaScript ES6+ (sintaxis `.jsx`)
- **Estilos:** Tailwind CSS con la librería `lucide-react` para iconografía
- **Componentes:** Componentes Funcionales (Functional Components) con React Hooks

### Crear un Nuevo Componente

```jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MiComponente({ label, onChange }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h2 className="text-xl font-bold">{label}</h2>
      <Button onClick={() => setClicked(true)}>
        Acción
      </Button>
    </div>
  );
}
```

---

## 📄 Licencia

Proyecto propietario de La Casona. Todos los derechos reservados.
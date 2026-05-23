# CHANGELOG - Frontend Auth

Este documento registra los cambios arquitectónicos y de refactorización relacionados con el módulo de Autenticación del Frontend.

## Evolución a Vite SPA

Durante la migración de Next.js a Vite SPA, se realizaron los siguientes cambios en los archivos de autenticación:

- Se eliminó el uso de TypeScript (`.tsx` -> `.jsx`).
- Se sustituyó `next/navigation` (`useRouter`) por `react-router-dom` (`useNavigate`).
- Se registró el flujo de rutas protegidas dentro del archivo `AppRouter.jsx` en lugar del router de Next.js.

## Nuevos módulos implementados

- `context/AuthContext.jsx`
  - Provee el contexto global de autenticación.
  - Mantiene `user`, `token`, `isAuthenticated`.
  - Expone `login(token, userData)`, `logout()` y `updateUser()`.

- `components/auth/ProtectedRoute.jsx`
  - Componente de envoltura para proteger rutas.
  - Redirige a `/login` si `isAuthenticated` es falso.

- `components/auth/Login.jsx` (Refactorizado a Enterprise UI/UX)
  - Diseño "Split Screen" utilizando Tailwind CSS y la imagen de marca de La Casona.
  - Gestión de estado del formulario migrado a `react-hook-form` acoplado con `@hookform/resolvers/zod`.
  - Botón de visibilidad de contraseña incorporado con `lucide-react`.
  - Botón principal con estado de carga (`disabled` + animación de spinner).
  - Alerta elegante animada en lugar del `alert()` nativo cuando falla la API.
  - Enlace incluido hacia `/forgot-password`.

- `components/auth/Profile.jsx`
  - Vista protegida para mostrar y editar datos del usuario.
  - Hace GET `/auth/profile` al montarse.
  - Hace PUT `/users/:id` para actualizar nombre y teléfono.
  - Incluye botón de `Cerrar sesión` que ejecuta `logout()`.

## Registro en la aplicación principal (AppRouter)

El registro en el enrutador de React (`react-router-dom`) se realiza en `src/AppRouter.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/components/auth/Login";
import { Profile } from "@/components/auth/Profile";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Otras Rutas Públicas */}

        {/* Rutas Protegidas */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

## Notas de configuración de entorno

- El proyecto actual usa `VITE_API_URL` en `lib/api-client.js`.
- Asegúrate de definir la variable en tu entorno de desarrollo o producción (`.env.local`):

```env
VITE_API_URL=http://localhost:3000/api
```

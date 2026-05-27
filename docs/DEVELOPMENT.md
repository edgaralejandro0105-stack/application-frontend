# La Casona - Guía de Desarrollo

Esta guía proporciona la información necesaria para los desarrolladores que trabajan en el frontend de **La Casona**. Cubre la configuración local, flujo de desarrollo, creación de componentes, consumo de servicios y buenas prácticas.

---

## Índice

- [Prerrequisitos](#prerrequisitos)
- [Inicio Rápido](#inicio-rápido)
- [Flujo de Trabajo Diario](#flujo-de-trabajo-diario)
- [Creación de Componentes](#creación-de-componentes)
- [Consumo de API y Servicios](#consumo-de-api-y-servicios)
- [Manejo de Formularios](#manejo-de-formularios)
- [Construcción y Producción](#construcción-y-producción)
- [Buenas Prácticas](#buenas-prácticas)

---

## Prerrequisitos

### Software Requerido

*   **Node.js**: Versión 18.0 o superior (Recomendado v20+)
*   **NPM**: Gestor de paquetes nativo
*   **Git**: Control de versiones

### Herramientas Recomendadas

*   **VS Code** con las siguientes extensiones:
    *   *Tailwind CSS IntelliSense* (autocompletado de clases)
    *   *ESLint* (validación de código)
    *   *Prettier* (formateador automático de código al guardar)

---

## Inicio Rápido

### 1. Instalación de dependencias

Accede al directorio del frontend e instala las librerías necesarias:

```bash
cd "Frontend Casona"
npm install
```

### 2. Variables de entorno

Crea o verifica tu archivo `.env.local` en la raíz del proyecto para conectar con la API:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar servidor de desarrollo

Ejecuta el servidor local de desarrollo:

```bash
npm run dev
```

El servidor iniciará en el puerto **3001** (configurable en `vite.config.js`). Visita `http://localhost:3001` en tu navegador.

---

## Flujo de Trabajo Diario

1.  Inicia el servidor local: `npm run dev`.
2.  Desarrolla en la rama correspondiente de Git.
3.  Modifica únicamente los archivos dentro de `src/`, `components/`, `context/` y `lib/`.
4.  Mantén abierta la consola para monitorear advertencias o errores del linter de ESLint.
5.  Usa el formateador automático para asegurar que el código cumpla con las reglas en `.prettierrc.js`.

---

## Creación de Componentes

### Componentes UI Comunes (Shadcn UI)

Cuando necesites un nuevo elemento básico de interfaz (como un botón, un diálogo, un select, etc.), utiliza los componentes ya instalados en `components/ui/`.
*   **NO** instales librerías de componentes Bootstrap o CoreUI.
*   **NO** crees clases CSS pesadas. Usa las utilidades de **Tailwind CSS**.

### Creación de Vistas de Módulo

Las vistas de cada módulo (como clientes, inventario, etc.) se alojan en `components/views/` en formato `.jsx`.

**Ejemplo de una Vista de Negocio básica:**

```jsx
import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function MiModuloView() {
  const [data, setData] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    // Lógica para cargar datos iniciales usando un servicio
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mi Módulo</h1>
        <Button onClick={() => toast({ title: "Acción realizada" })}>
          Acción
        </Button>
      </div>

      <Card className="border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Datos del Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contenido del módulo aquí...</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Consumo de API y Servicios

### Cliente API Centralizado (`lib/api-client.js`)

Toda petición HTTP debe canalizarse a través del cliente `apiClient`. Este cliente se encarga automáticamente de:
1.  Inyectar la URL base configurada en `VITE_API_URL`.
2.  Extraer y adjuntar el token JWT almacenado en `localStorage` en las cabeceras `Authorization`.
3.  Procesar respuestas JSON o lanzar errores formateados.

### Capa de Servicios (`lib/services/`)

Nunca realices llamados directos a `fetch` en tus componentes React. Crea un servicio para encapsular la lógica de consumo del backend.

**Ejemplo de servicio (`lib/services/ejemplo.service.js`):**

```javascript
import { apiClient } from "../api-client"

export const ejemploService = {
  // Obtener lista completa
  getAll: async () => {
    return apiClient.get("/ejemplo")
  },

  // Crear un registro nuevo
  create: async (datos) => {
    return apiClient.post("/ejemplo", datos)
  },

  // Eliminar un registro
  delete: async (id) => {
    return apiClient.delete(`/ejemplo/${id}`)
  }
}
```

---

## Manejo de Formularios

Para formularios dinámicos y validaciones de lado de cliente, utilizamos **React Hook Form** y **Zod**.

*   Define un esquema de validación con **Zod** (para tipos de datos, correos, mínimos de caracteres).
*   Enlaza el esquema a **React Hook Form** usando `@hookform/resolvers/zod`.
*   Usa los componentes inputs de Shadcn UI de forma controlada.

---

## Construcción y Producción

### Generar compilación

Antes de desplegar a producción, compila el proyecto usando:

```bash
npm run build
```

Esto ejecutará `vite build`, el cual compilará el código y generará los assets optimizados en el directorio `/dist`.

### Probar compilación localmente

Para simular cómo correrá el proyecto compilado de producción en local:

```bash
npm run start
```

---

## Buenas Prácticas

1.  **Evitar CSS Tradicional**: Usa las clases utilitarias de Tailwind v4 y variables CSS preestablecidas de la paleta del sistema.
2.  **Modularidad de Componentes**: Si un bloque de código JSX supera las 200 líneas o se repite en varias partes, extráelo a un componente reutilizable.
3.  **Seguridad**: Nunca almacenes contraseñas, tokens secretos u otras credenciales en código duro o en repositorios Git públicos. Usa variables `.env.local` que no se trackean.
4.  **Flujo Limpio de Autenticación**: Siempre usa el contexto `useAuth()` para validar el rol del usuario, mostrar información de perfil o cerrar la sesión.

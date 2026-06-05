# Documentación de Conexión Frontend - Backend

Este documento detalla la arquitectura y el flujo de comunicación entre el frontend (React/Vite) y el backend en el proyecto de La Casona.

## 1. Arquitectura Central (`lib/api-client.js`)

Toda la comunicación con el backend se centraliza a través de la clase `ApiClient` definida en `lib/api-client.js`. Esto permite mantener un control estricto sobre las peticiones, la inyección de headers, el manejo de errores y la autenticación.

### Configuración del Base URL
El cliente obtiene la URL del backend a través de variables de entorno de Vite:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
```

### Características Principales del `ApiClient`:
- **Headers Automáticos**: Inyecta por defecto `Content-Type: application/json`.
- **Autenticación Automática**: Si existe un token JWT (`authToken`) en el `localStorage`, se inyecta automáticamente en el header `Authorization: Bearer <token>`, a menos que se especifique explícitamente ignorarlo mediante `skipAuth: true`.
- **Manejo Estructurado de Errores**: Captura los errores HTTP e intenta extraer el mensaje de error que devuelve el backend (`errData.message`). Si falla la petición, retorna una estructura unificada: `{ error: errorMessage, status: 500 }`.
- **Respuestas Uniformes**: Las peticiones exitosas retornan un objeto unificado con la forma `{ data, status }`.
- **Soporte para Archivos**: Permite descargar archivos si se especifica `responseType: 'blob'`.

### Métodos Disponibles
La instancia exportada `apiClient` expone los métodos HTTP clásicos que encapsulan el método central `request`:
- `apiClient.get(endpoint, options)`
- `apiClient.post(endpoint, body, options)`
- `apiClient.put(endpoint, body, options)`
- `apiClient.delete(endpoint, options)`

## 2. Capa de Servicios (`lib/services/`)

El sistema utiliza el patrón "Service" para aislar la lógica de conexión a las APIs específicas de cada módulo o dominio. Estos servicios importan la instancia de `apiClient` y definen métodos con semántica de negocio.

Ejemplos de servicios actuales:
- `auth.service.js`: Autenticación, registro, recuperación de contraseña.
- `client.service.js`: ABM de clientes.
- `dashboard.service.js`: Métricas del dashboard.
- `employee.service.js`: Gestión de empleados.
- `event.service.js`: Eventos de La Casona.
- `inventory.service.js` y `inventorybar.service.js`: Gestión de inventario.
- `product.service.js`: Productos.
- `provider.service.js`: Proveedores.
- `report.service.js`: Reportes.
- `sale.service.js`: Ventas y transacciones.
- `venue.service.js`: Gestión del local.

### Ejemplo de Implementación (Servicio de Clientes):
```javascript
import { apiClient } from "@/lib/api-client";

export const clientService = {
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    const endpoint = `/clients${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  async getById(id) {
    return apiClient.get(`/clients/${id}`);
  },
  async create(data) {
    return apiClient.post("/clients", data);
  }
};
```

## 3. Flujo de Autenticación y JWT

El servicio de autenticación (`auth.service.js`) tiene un tratamiento especial debido a que administra el ciclo de vida del token.

### Login / Registro
1. Se envían credenciales mediante `apiClient.post` con `{ skipAuth: true }` para evitar inyectar un token inexistente.
2. Al recibir la respuesta, el servicio extrae `token` y `refreshToken` y los persiste en `localStorage`.

### Mantenimiento de Sesión
- El `ApiClient` lee el `authToken` de `localStorage` en cada petición.
- Existe un método `refreshToken()` en `auth.service.js` diseñado para renovar el token principal cuando este expira, utilizando el `refreshToken` de larga duración.

### Logout
1. Realiza una petición al backend para invalidar la sesión (opcional dependiendo de cómo esté configurado el backend).
2. Borra el `authToken`, `refreshToken` y `authUser` del `localStorage`.

## 4. Mejores Prácticas en el Desarrollo

1. **Nunca usar `fetch` directamente en componentes**: Siempre se debe crear o utilizar un servicio dentro de `lib/services/` que haga uso de `apiClient`.
2. **Componentes Limpios**: Los componentes de React (archivos `.jsx`) solo deben llamar a métodos como `clientService.getAll()` y manejar el estado (`useState`, `useEffect` o hooks como SWR/React Query si se implementan en el futuro), no deben conocer sobre URLs ni headers.
3. **Manejo de Errores**: Al invocar un servicio, siempre verificar si la respuesta contiene un error y mostrar feedback al usuario de forma amigable.
   ```javascript
   const response = await clientService.create(data);
   if (response.error) {
     toast.error("Error: " + response.error);
   } else {
     toast.success("Creado correctamente");
   }
   ```

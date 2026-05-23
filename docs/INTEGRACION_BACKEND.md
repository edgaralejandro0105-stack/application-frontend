# Guía Técnica de Integración Frontend-Backend - La Casona

## 📋 Índice de Contenidos

1. [Descripción General](#descripción-general)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Cliente HTTP Centralizado](#cliente-http-centralizado)
4. [Servicios Disponibles](#servicios-disponibles)
5. [Patrones de Integración](#patrones-de-integración)
6. [Manejo de Errores](#manejo-de-errores)
7. [Seguridad y Tokens](#seguridad-y-tokens)
8. [Testing](#testing-de-integraciones)

---

## Descripción General

Este documento detalla cómo el frontend de La Casona se integra con el backend a través de un cliente HTTP centralizado y servicios especializados. La arquitectura permite mantener una separación clara entre la lógica de UI y la comunicación con el servidor.

### Principios de Diseño

- **Centralización:** Un único punto de entrada para todas las peticiones HTTP
- **Reutilización:** Servicios encapsulados para cada dominio
- **Tipo-Seguridad:** TypeScript para validación en tiempo de compilación
- **Manejo de Errores:** Consistente en toda la aplicación
- **Autenticación:** Manejo automático de tokens JWT

---

## Configuración del Entorno

### Variables de Entorno Requeridas

Crear archivo `.env.local` en la raíz del proyecto frontend:

```env
# URL base del servidor API
VITE_API_URL=http://localhost:3000/api

# Opcional: Timeout para peticiones (milisegundos)
VITE_API_TIMEOUT=30000

# Opcional: Modo de debug
VITE_DEBUG_API=false
```

### Estructura de Conexión

```
Frontend (localhost:3001)
    └── API Client (lib/api-client.ts)
            └── Backend API (localhost:3000/api)
                    ├── /auth
                    ├── /events
                    ├── /clients
                    ├── /inventory
                    ├── /sales
                    ├── /employees
                    ├── /products
                    └── /venues
```

### Verificación de Conectividad

```bash
# Verificar que el backend está disponible
curl http://localhost:3000/api/health

# Respuesta esperada
{"status": "ok", "timestamp": "2024-05-21T10:30:00Z"}
```

---

## Cliente HTTP Centralizado

### Archivo: `lib/api-client.ts`

Cliente HTTP que centraliza toda comunicación con el backend.

#### Características Principales

| Característica        | Descripción                                    |
| --------------------- | ---------------------------------------------- |
| **Métodos HTTP**      | GET, POST, PUT, DELETE con soporte genérico    |
| **Autenticación**     | Inyección automática de tokens JWT             |
| **Manejo de Errores** | Centralizado con mensajes consistentes         |
| **Timeout**           | Configurable por petición                      |
| **Interceptores**     | Para pre/post procesamiento                    |
| **Tipado Genérico**   | TypeScript para respuestas fuertemente tipadas |

#### API Reference

```typescript
import { apiClient } from "@/lib/api-client";

// GET - Obtener datos
interface User {
  id: string;
  name: string;
  email: string;
}
const user = await apiClient.get<User>("/users/123");

// POST - Crear recurso
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
const newUser = await apiClient.post<User>("/users", {
  name: "Juan",
  email: "juan@example.com",
  password: "secure123",
});

// PUT - Actualizar recurso
const updated = await apiClient.put<User>("/users/123", {
  name: "Juan Actualizado",
});

// DELETE - Eliminar recurso
await apiClient.delete("/users/123");

// Opciones avanzadas
const customResponse = await apiClient.get<User>("/users/123", {
  timeout: 5000,
  headers: { "X-Custom-Header": "value" },
});
```

#### Estructura Interna

```typescript
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

interface ApiError {
  status: number;
  message: string;
  details?: any;
}
```

---

## Servicios Disponibles

### 1. Authentication Service

**Archivo:** `lib/services/auth.service.ts`

Gestiona autenticación, autorización y sesión de usuario.

#### Métodos

```typescript
import { authService } from "@/lib/services/auth.service";

// Login
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
const response = await authService.login({
  email: "user@example.com",
  password: "pass123",
});

// Register
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
await authService.register({
  email: "new@example.com",
  password: "secure123",
  name: "Nuevo Usuario",
});

// Obtener perfil del usuario actual
const profile = await authService.getProfile();

// Refrescar token (automático)
await authService.refreshToken();

// Logout
authService.logout(); // Limpia tokens y sesión

// Verificar autenticación
const isAuth = authService.isAuthenticated();

// Obtener token actual
const token = authService.getToken();
```

#### Endpoints Backend

| Método | Endpoint                  | Descripción                           |
| ------ | ------------------------- | ------------------------------------- |
| POST   | `/api/auth/login`         | Autenticación de usuario              |
| POST   | `/api/auth/register`      | Registro de nuevo usuario             |
| GET    | `/api/auth/profile`       | Obtener datos del usuario autenticado |
| POST   | `/api/auth/refresh-token` | Renovar token de acceso               |
| POST   | `/api/auth/logout`        | Cerrar sesión                         |

---

### 2. Events Service

**Archivo:** `lib/services/event.service.ts`

Gestiona eventos y su ciclo de vida.

#### Métodos

```typescript
import { eventService } from "@/lib/services/event.service";

interface Event {
  id: string;
  client_id: string;
  venue_id: string;
  name: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

// Obtener todos los eventos
const events = await eventService.getAll();

// Obtener evento específico
const event = await eventService.getById("evt-123");

// Crear evento
await eventService.create({
  client_id: "client-456",
  venue_id: "venue-789",
  name: "Boda",
  date: "2024-06-15",
  status: "pending",
});

// Actualizar evento
await eventService.update("evt-123", {
  status: "confirmed",
  name: "Boda Actualizada",
});

// Eliminar evento
await eventService.delete("evt-123");

// Obtener próximos eventos (últimos N)
const upcoming = await eventService.getUpcoming(5);

// Obtener eventos por estado
const completed = await eventService.getByStatus("completed");
```

#### Endpoints Backend

| Método | Endpoint               | Descripción               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/events`          | Listar todos los eventos  |
| GET    | `/api/events/{id}`     | Obtener evento específico |
| GET    | `/api/events/upcoming` | Próximos eventos          |
| POST   | `/api/events`          | Crear evento              |
| PUT    | `/api/events/{id}`     | Actualizar evento         |
| DELETE | `/api/events/{id}`     | Eliminar evento           |

---

### 3. Clients Service

**Archivo:** `lib/services/client.service.ts`

Gestiona clientes (CRM).

#### Métodos

```typescript
import { clientService } from "@/lib/services/client.service";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  created_at?: string;
}

// Obtener todos
const clients = await clientService.getAll();

// Obtener por ID
const client = await clientService.getById("client-123");

// Crear cliente
await clientService.create({
  name: "Empresa XYZ",
  email: "contacto@empresa.com",
  phone: "+34 612345678",
  company: "XYZ Corp",
  address: "Calle Principal 123",
  city: "Madrid",
});

// Actualizar
await clientService.update("client-123", {
  phone: "+34 612345679",
  email: "nuevo@empresa.com",
});

// Eliminar
await clientService.delete("client-123");

// Contar clientes activos
const count = await clientService.getActiveCount();

// Búsqueda por nombre
const results = await clientService.search("XYZ");
```

#### Endpoints Backend

| Método | Endpoint             | Descripción        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/clients`       | Listar clientes    |
| GET    | `/api/clients/{id}`  | Obtener cliente    |
| GET    | `/api/clients/count` | Contar clientes    |
| POST   | `/api/clients`       | Crear cliente      |
| PUT    | `/api/clients/{id}`  | Actualizar cliente |
| DELETE | `/api/clients/{id}`  | Eliminar cliente   |

---

### 4. Inventory Service

**Archivo:** `lib/services/inventory.service.ts`

Control de inventario y stock.

#### Métodos

```typescript
import { inventoryService } from "@/lib/services/inventory.service";

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  location: string;
}

// Obtener todo el inventario
const items = await inventoryService.getAll();

// Obtener artículos con stock bajo
const lowStock = await inventoryService.getLowStockItems();

// Contar alertas de stock bajo
const alerts = await inventoryService.getLowStockCount();

// Crear entrada de inventario
await inventoryService.create({
  product_id: "prod-123",
  quantity: 100,
  min_quantity: 10,
  location: "Almacén A",
});

// Actualizar cantidad
await inventoryService.update("inv-456", {
  quantity: 80,
});

// Eliminar
await inventoryService.delete("inv-456");

// Obtener por producto
const items = await inventoryService.getByProduct("prod-123");
```

#### Endpoints Backend

| Método | Endpoint                   | Descripción       |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/inventory`           | Listar inventario |
| GET    | `/api/inventory/low-stock` | Stock bajo        |
| GET    | `/api/inventory/{id}`      | Obtener ítem      |
| POST   | `/api/inventory`           | Crear entrada     |
| PUT    | `/api/inventory/{id}`      | Actualizar        |
| DELETE | `/api/inventory/{id}`      | Eliminar          |

---

### 5. Sales Service

**Archivo:** `lib/services/sale.service.ts`

Registro y análisis de ventas.

#### Métodos

```typescript
import { saleService } from "@/lib/services/sale.service";

interface Sale {
  id: string;
  event_id: string;
  total_amount: number;
  payment_method: "card" | "cash" | "transfer" | "check";
  status: "pending" | "completed" | "cancelled";
  created_at?: string;
}

// Obtener todas las ventas
const sales = await saleService.getAll();

// Obtener ventas recientes
const recent = await saleService.getRecent(10);

// Obtener total de ingresos
const revenue = await saleService.getTotalRevenue();

// Crear venta
await saleService.create({
  event_id: "evt-789",
  total_amount: 2500.0,
  payment_method: "card",
});

// Actualizar venta
await saleService.update("sale-123", {
  status: "completed",
  total_amount: 2600.0,
});

// Eliminar venta
await saleService.delete("sale-123");

// Ingresos por período
const monthly = await saleService.getRevenueByPeriod("2024-05");
```

#### Endpoints Backend

| Método | Endpoint             | Descripción      |
| ------ | -------------------- | ---------------- |
| GET    | `/api/sales`         | Listar ventas    |
| GET    | `/api/sales/recent`  | Ventas recientes |
| GET    | `/api/sales/revenue` | Ingresos totales |
| POST   | `/api/sales`         | Crear venta      |
| PUT    | `/api/sales/{id}`    | Actualizar       |
| DELETE | `/api/sales/{id}`    | Eliminar         |

---

### 6. Employees Service

**Archivo:** `lib/services/employee.service.ts`

Gestión de recursos humanos.

#### Métodos

```typescript
import { employeeService } from "@/lib/services/employee.service";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: "active" | "inactive";
}

// Obtener todos
const employees = await employeeService.getAll();

// Obtener por ID
const emp = await employeeService.getById("emp-123");

// Crear empleado
await employeeService.create({
  name: "Carlos García",
  email: "carlos@lacasona.com",
  phone: "+34 612345680",
  position: "Event Manager",
  department: "Operaciones",
});

// Actualizar
await employeeService.update("emp-123", {
  position: "Senior Event Manager",
});

// Eliminar
await employeeService.delete("emp-123");

// Contar activos
const count = await employeeService.getActiveCount();

// Por departamento
const ops = await employeeService.getByDepartment("Operaciones");
```

#### Endpoints Backend

| Método | Endpoint               | Descripción      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/employees`       | Listar empleados |
| GET    | `/api/employees/{id}`  | Obtener empleado |
| GET    | `/api/employees/count` | Contar activos   |
| POST   | `/api/employees`       | Crear empleado   |
| PUT    | `/api/employees/{id}`  | Actualizar       |
| DELETE | `/api/employees/{id}`  | Eliminar         |

---

### 7. Products Service

**Archivo:** `lib/services/product.service.ts`

Catálogo de productos.

#### Métodos

```typescript
import { productService } from "@/lib/services/product.service";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

// Obtener todos
const products = await productService.getAll();

// Obtener por ID
const prod = await productService.getById("prod-123");

// Crear
await productService.create({
  name: "Decoración Floral",
  price: 500.0,
  category: "Decoración",
});

// Actualizar
await productService.update("prod-123", {
  price: 550.0,
});

// Eliminar
await productService.delete("prod-123");

// Por categoría
const decorations = await productService.getByCategory("Decoración");
```

#### Endpoints Backend

| Método | Endpoint             | Descripción      |
| ------ | -------------------- | ---------------- |
| GET    | `/api/products`      | Listar productos |
| GET    | `/api/products/{id}` | Obtener producto |
| POST   | `/api/products`      | Crear            |
| PUT    | `/api/products/{id}` | Actualizar       |
| DELETE | `/api/products/{id}` | Eliminar         |

---

### 8. Venues Service

**Archivo:** `lib/services/venue.service.ts`

Gestión de sedes/locales.

#### Métodos

```typescript
import { venueService } from "@/lib/services/venue.service";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  features?: string[];
}

// Obtener todas
const venues = await venueService.getAll();

// Obtener por ID
const venue = await venueService.getById("venue-123");

// Crear
await venueService.create({
  name: "Salón Principal",
  address: "Calle Mayor 456",
  city: "Madrid",
  capacity: 300,
});

// Actualizar
await venueService.update("venue-123", {
  capacity: 350,
});

// Eliminar
await venueService.delete("venue-123");

// Por ciudad
const madrid = await venueService.getByCity("Madrid");

// Disponibilidad
const available = await venueService.getAvailable("2024-06-15");
```

#### Endpoints Backend

| Método | Endpoint           | Descripción  |
| ------ | ------------------ | ------------ |
| GET    | `/api/venues`      | Listar sedes |
| GET    | `/api/venues/{id}` | Obtener sede |
| POST   | `/api/venues`      | Crear        |
| PUT    | `/api/venues/{id}` | Actualizar   |
| DELETE | `/api/venues/{id}` | Eliminar     |

---

## Patrones de Integración

### Patrón 1: Obtener y Mostrar Datos

```typescript
'use client'; // Client Component

import { useEffect, useState } from 'react';
import { eventService } from '@/lib/services/event.service';

interface Event {
  id: string;
  name: string;
  date: string;
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAll();
        setEvents(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {events.map(event => (
        <li key={event.id}>{event.name} - {event.date}</li>
      ))}
    </ul>
  );
}
```

### Patrón 2: Crear Recurso

```typescript
'use client';

import { clientService } from '@/lib/services/client.service';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

export function CreateClientForm() {
  const { register, handleSubmit } = useForm();
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    try {
      await clientService.create({
        name: data.name,
        email: data.email,
        phone: data.phone
      });

      toast({
        title: "Éxito",
        description: "Cliente creado correctamente",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} placeholder="Nombre" />
      <input {...register('email', { required: true })} placeholder="Email" />
      <input {...register('phone')} placeholder="Teléfono" />
      <button type="submit">Crear Cliente</button>
    </form>
  );
}
```

### Patrón 3: Actualizar Recurso

```typescript
'use client';

import { eventService } from '@/lib/services/event.service';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function UpdateEventStatus({ eventId, currentStatus }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await eventService.update(eventId, { status: newStatus });

      toast({
        title: "Actualizado",
        description: "Estado del evento actualizado"
      });

      router.refresh(); // Refrescar datos
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  return (
    <select onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="pending">Pendiente</option>
      <option value="confirmed">Confirmado</option>
      <option value="completed">Completado</option>
    </select>
  );
}
```

---

## Manejo de Errores

### Estructura de Errores

```typescript
interface ApiErrorResponse {
  status: number; // HTTP status code
  message: string; // Mensaje de error
  details?: any; // Detalles adicionales
  timestamp: string; // Cuándo ocurrió
  path?: string; // Endpoint que falló
}
```

### Captura y Manejo

```typescript
try {
  const result = await clientService.create(clientData);
} catch (error) {
  if (error instanceof Error) {
    // Error de red o del cliente
    console.error("Error:", error.message);

    // Mostrar notificación al usuario
    toast({
      title: "Error de conexión",
      description: "No se pudo conectar con el servidor",
      variant: "destructive",
    });
  } else if (typeof error === "object" && error !== null) {
    // Error de API
    const apiError = error as ApiErrorResponse;

    if (apiError.status === 401) {
      // No autorizado - redirigir a login
      router.push("/login");
    } else if (apiError.status === 400) {
      // Datos inválidos
      toast({
        title: "Datos inválidos",
        description: apiError.message,
        variant: "destructive",
      });
    } else if (apiError.status === 500) {
      // Error del servidor
      toast({
        title: "Error del servidor",
        description: "Intenta más tarde",
        variant: "destructive",
      });
    }
  }
}
```

### Códigos HTTP Comunes

| Código  | Significado        | Acción                        |
| ------- | ------------------ | ----------------------------- |
| 200-299 | Éxito              | Proceder normalmente          |
| 400     | Solicitud inválida | Mostrar errores de validación |
| 401     | No autorizado      | Redirigir a login             |
| 403     | Prohibido          | Mostrar acceso denegado       |
| 404     | No encontrado      | Mostrar página 404            |
| 500     | Error interno      | Mostrar error genérico        |

---

## Seguridad y Tokens

### Manejo de JWT

```typescript
// El token se almacena automáticamente después del login
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
});
// response.access_token se almacena internamente

// En cada petición, el cliente inyecta el token automáticamente:
// Authorization: Bearer {token}

// El token expira automáticamente (verificar con backend)
// Cuando expira, se intenta renovar con refresh_token
```

### Renovación Automática de Tokens

```typescript
// El cliente maneja automáticamente:
// 1. Detecta si el token está por expirar
// 2. Llama a POST /api/auth/refresh-token
// 3. Obtiene nuevo access_token
// 4. Reintenta la petición original

// No requiere intervención del desarrollador
```

### Logout

```typescript
// Limpiar sesión
authService.logout();

// Esto:
// - Elimina tokens de memoria
// - Elimina tokens de localStorage
// - Redirige a /login (si está configurado)
```

---

## Testing de Integraciones

### Ejemplo: Test de un Servicio

```typescript
// __tests__/services/event.service.test.ts

import { eventService } from "@/lib/services/event.service";
import { apiClient } from "@/lib/api-client";

jest.mock("@/lib/api-client");

describe("Event Service", () => {
  it("debe obtener todos los eventos", async () => {
    const mockEvents = [
      { id: "1", name: "Evento 1" },
      { id: "2", name: "Evento 2" },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue(mockEvents);

    const result = await eventService.getAll();

    expect(apiClient.get).toHaveBeenCalledWith("/events");
    expect(result).toEqual(mockEvents);
  });

  it("debe crear un evento", async () => {
    const mockEvent = { id: "1", name: "Nuevo Evento" };
    const data = { name: "Nuevo Evento" };

    (apiClient.post as jest.Mock).mockResolvedValue(mockEvent);

    const result = await eventService.create(data);

    expect(apiClient.post).toHaveBeenCalledWith("/events", data);
    expect(result).toEqual(mockEvent);
  });
});
```

### Verificación Manual

```bash
# 1. Verificar que el backend está corriendo
curl http://localhost:3000/api/health

# 2. Probar endpoint de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Probar con token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/events
```

---

## Troubleshooting

### Problema: "404 Not Found" en endpoints

**Soluciones:**

1. Verificar que el endpoint está en [VITE_API_URL]/api
2. Confirmar que el backend está ejecutándose
3. Revisar logs del backend para detalles

### Problema: "401 Unauthorized"

**Soluciones:**

1. Token expirado - hacer login de nuevo
2. Token no enviado - verificar configuración en apiClient
3. Token inválido - borrar localStorage y hacer login

### Problema: "CORS Error"

**Soluciones:**

1. Backend debe permitir origin `http://localhost:3001`
2. Headers CORS deben incluir `Access-Control-Allow-Credentials`
3. Verificar configuración CORS en backend

### Problema: Timeout en peticiones

**Soluciones:**

1. Aumentar timeout: `VITE_API_TIMEOUT=60000`
2. Verificar velocidad de red
3. Revisar logs del backend para peticiones lentas

---

## Referencias y Recursos

- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT.io: JSON Web Tokens](https://jwt.io/)
- [REST Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html#status.codes)

// Create
await eventService.create({ client_id, venue_id, name, date, status });

// Update
await eventService.update(id, { name, status });

// Delete
await eventService.delete(id);

// Get upcoming (próximos 5)
await eventService.getUpcoming(5);

````

**Backend Endpoints:**

- GET `/api/events`
- GET `/api/events/{id}`
- POST `/api/events`
- PUT `/api/events/{id}`
- DELETE `/api/events/{id}`

---

### 3. **Client Service** (`lib/services/client.service.ts`)

```typescript
import { clientService } from "@/lib/services/client.service";

// Get all clients
await clientService.getAll();

// Get by ID
await clientService.getById(id);

// Create
await clientService.create({ name, email, phone, company, address, city });

// Update
await clientService.update(id, { name, email });

// Delete
await clientService.delete(id);

// Get active count
await clientService.getActiveCount();
````

**Backend Endpoints:**

- GET `/api/clients`
- GET `/api/clients/{id}`
- POST `/api/clients`
- PUT `/api/clients/{id}`
- DELETE `/api/clients/{id}`

---

### 4. **Inventory Service** (`lib/services/inventory.service.ts`)

```typescript
import { inventoryService } from "@/lib/services/inventory.service";

// Get all items
await inventoryService.getAll();

// Get low stock items
await inventoryService.getLowStockItems();

// Get count of low stock alerts
await inventoryService.getLowStockCount();

// Create
await inventoryService.create({ product_id, quantity, min_quantity, location });

// Update
await inventoryService.update(id, { quantity });

// Delete
await inventoryService.delete(id);
```

**Backend Endpoints:**

- GET `/api/inventory`
- POST `/api/inventory`
- PUT `/api/inventory/{id}`
- DELETE `/api/inventory/{id}`

---

### 5. **Sale Service** (`lib/services/sale.service.ts`)

```typescript
import { saleService } from "@/lib/services/sale.service";

// Get all sales
await saleService.getAll();

// Get recent sales
await saleService.getRecent(5);

// Calculate total revenue
await saleService.getTotalRevenue();

// Create
await saleService.create({ event_id, total_amount, payment_method });

// Update
await saleService.update(id, { total_amount, status });

// Delete
await saleService.delete(id);
```

**Backend Endpoints:**

- GET `/api/sales`
- POST `/api/sales`
- PUT `/api/sales/{id}`
- DELETE `/api/sales/{id}`

---

### 6. **Employee Service** (`lib/services/employee.service.ts`)

```typescript
import { employeeService } from "@/lib/services/employee.service";

// Get all employees
await employeeService.getAll();

// Get by ID
await employeeService.getById(id);

// Create
await employeeService.create({ name, email, phone, position, department });

// Update
await employeeService.update(id, { name, position });

// Delete
await employeeService.delete(id);

// Get active count
await employeeService.getActiveCount();
```

**Backend Endpoints:**

- GET `/api/employees`
- POST `/api/employees`
- PUT `/api/employees/{id}`
- DELETE `/api/employees/{id}`

---

### 7. **Product Service** (`lib/services/product.service.ts`)

```typescript
import { productService } from "@/lib/services/product.service";

// Get all products
await productService.getAll();

// Get by ID
await productService.getById(id);

// Create
await productService.create({ name, price, category });

// Update
await productService.update(id, { name, price });

// Delete
await productService.delete(id);
```

**Backend Endpoints:**

- GET `/api/products`
- POST `/api/products`
- PUT `/api/products/{id}`
- DELETE `/api/products/{id}`

---

### 8. **Venue Service** (`lib/services/venue.service.ts`)

```typescript
import { venueService } from "@/lib/services/venue.service";

// Get all venues
await venueService.getAll();

// Get by ID
await venueService.getById(id);

// Create
await venueService.create({ name, address, city, capacity });

// Update
await venueService.update(id, { name, capacity });

// Delete
await venueService.delete(id);
```

**Backend Endpoints:**

- GET `/api/venues`
- POST `/api/venues`
- PUT `/api/venues/{id}`
- DELETE `/api/venues/{id}`

---

### 9. **Dashboard Service** (`lib/services/dashboard.service.ts`)

```typescript
import { dashboardService } from "@/lib/services/dashboard.service";

// Get all dashboard data
await dashboardService.getDashboardData();

// Get stats only
await dashboardService.getStats();
```

**Backend Endpoints:**

- GET `/api/dashboard`

---

## 💾 Almacenamiento de Token

El token JWT se almacena automáticamente en `localStorage` con la clave `authToken` cuando se realiza login.

Para acceder al token manualmente:

```typescript
const token = localStorage.getItem("authToken");
```

Para eliminar (logout):

```typescript
localStorage.removeItem("authToken");
localStorage.removeItem("refreshToken");
```

---

## 🔐 Autenticación en Requests

El API client añade automáticamente el header `Authorization: Bearer {token}` a todas las peticiones excepto aquellas con `skipAuth: true`.

```typescript
// Necesita autenticación (automático)
await apiClient.get("/auth/profile");

// Sin autenticación requerida
await authService.login(credentials); // skipAuth: true internamente
```

---

## ⚠️ Manejo de Errores

Todas las peticiones retornan un objeto con esta estructura:

```typescript
{
  data?: T,        // Datos si la petición fue exitosa
  error?: string,  // Mensaje de error si falló
  status?: number  // Código HTTP
}
```

**Ejemplo:**

```typescript
const response = await eventService.getAll();

if (response.error) {
  console.error("Error:", response.error);
  // Manejar error
} else {
  const events = response.data;
  // Usar datos
}
```

---

## 🎨 Vistas Actualizadas

### Dashboard View (`components/views/dashboard-view.tsx`)

✅ **Completamente integrada**

- Carga datos reales del backend
- Calcula estadísticas en tiempo real
- Muestra eventos próximos y ventas recientes
- Estados de carga y error

### Events View (`components/views/events-view.tsx`)

📝 **Pendiente de actualización**

- Aún tiene datos mock parciales
- Debería usar `eventService` para CRUD completo

### CRM View (`components/views/crm-view.tsx`)

📝 **Pendiente de actualización**

- Debe usar `clientService` para gestionar clientes

### Inventory View (`components/views/inventory-view.tsx`)

📝 **Pendiente de actualización**

- Debe usar `inventoryService` para gestionar inventario

### HR View (`components/views/hr-view.tsx`)

📝 **Pendiente de actualización**

- Debe usar `employeeService` para gestionar empleados

### Admin View (`components/views/admin-view.tsx`)

📝 **Pendiente de actualización**

- Debería tener opciones de administración general

---

## 🚀 Cómo Usar en un Componente

### Ejemplo: Cargar Eventos

```typescript
"use client"

import { useEffect, useState } from 'react'
import { eventService, Event } from '@/lib/services/event.service'

export function MyComponent() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const response = await eventService.getAll()

        if (response.error) {
          setError(response.error)
        } else {
          setEvents(response.data || [])
        }
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.name}</div>
      ))}
    </div>
  )
}
```

---

## 🔄 Próximos Pasos

1. **Actualizar todas las vistas** para usar servicios en lugar de mock data
2. **Implementar formularios** con validación
3. **Agregar filtros** en las vistas
4. **Implementar notificaciones** de éxito/error
5. **Agregar funcionalidad** de edición en todas las vistas
6. **Crear un contexto** de autenticación global (opcional)

---

## ⚙️ Información Importante

### Cambios NO hechos en el Backend

Como solicitaste, NO se ha modificado nada en el backend. Solo se creó la capa de comunicación en el frontend.

### CORS

El backend está configurado con CORS para aceptar peticiones desde `http://localhost:3001/api`. Si cambias la URL, actualiza las configuraciones de CORS en el backend en `server.js`.

### Prueba de Conexión

Para verificar que todo está funcionando:

1. Asegúrate que el backend está corriendo: `npm start` en la carpeta `backend casona`
2. Asegúrate que el frontend está corriendo: `npm run dev` en la carpeta `Frontend Casona`
3. Abre el navegador en `http://localhost:3001` (o el puerto que uses)
4. Abre la consola del navegador (F12) y verifica que no haya errores de CORS

---

## 📞 Soporte

Si tienes dudas sobre cómo usar algún servicio o necesitas agregar nuevos endpoints, avísame y actualizaré los servicios correspondientes.

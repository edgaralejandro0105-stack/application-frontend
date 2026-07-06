# Plan de Implementación — Sistema La Casona

> **Versión:** 1.0  
> **Fecha:** Julio 2026  
> **Propósito:** Auditoría del sistema actual y hoja de ruta de mejoras priorizadas.

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Hallazgos de la Auditoría](#2-hallazgos-de-la-auditoría)
3. [Plan de Implementación por Fases](#3-plan-de-implementación-por-fases)
   - [Fase 1 — Correcciones Críticas (Semana 1-2)](#fase-1--correcciones-críticas-semana-1-2)
   - [Fase 2 — Calidad y Estabilidad (Semana 3-4)](#fase-2--calidad-y-estabilidad-semana-3-4)
   - [Fase 3 — Nuevas Funcionalidades (Semana 5-8)](#fase-3--nuevas-funcionalidades-semana-5-8)
   - [Fase 4 — Optimización y DevOps (Semana 9-12)](#fase-4--optimización-y-devops-semana-9-12)
4. [Nuevas Funcionalidades Propuestas](#4-nuevas-funcionalidades-propuestas)
5. [Recomendaciones Técnicas Adicionales](#5-recomendaciones-técnicas-adicionales)

---

## 1. Resumen Ejecutivo

**La Casona** es un sistema administrativo completo para una agencia de eventos. Actualmente cuenta con **módulos funcionales** (Dashboard, Eventos, CRM, Inventario, Ventas/POS, RRHH, Proveedores, Administración) pero presenta **deudas técnicas** significativas: código en JavaScript sin tipos, cero tests automatizados, sin CI/CD, y prácticas de estado inconsistentes.

**Tamaño del proyecto:** ~45+ componentes UI, 13 servicios API, 9 vistas principales.  
**Stack actual:** React 19 + Vite 8 + Tailwind v4 + Radix UI + Shadcn.  
**Estado:** Producción activa con documentación excelente pero código mejorable.

**Prioridad inmediata:** Tests, TypeScript, Error Boundaries, eliminar `alert()` y directivas `"use client"`.

---

## 2. Hallazgos de la Auditoría

### 2.1 Fortalezas
- Documentación completa y en español
- UI moderna con Shadcn/Radix y modo oscuro
- Sistema de autenticación robusto (JWT + refresh)
- Separación clara en capas (componentes → servicios → API client)
- Notificaciones en tiempo real (Socket.io)
- Integración con backend bien definida

### 2.2 Deudas Técnicas

| # | Problema | Impacto | Urgencia |
|---|----------|---------|----------|
| 1 | **Sin tests automatizados** | Alto — no hay seguridad al refactorizar | Crítica |
| 2 | **JavaScript plano (sin TypeScript)** | Alto — errores en runtime evitables | Crítica |
| 3 | **Sin Error Boundary global** | Alto — errores inesperados rompen toda la app | Alta |
| 4 | **Uso de `alert()` en lugar de toasts/modales** | Medio — UX inconsistente | Alta |
| 5 | **Directivas `"use client"` residuales** | Bajo — código muerto de Next.js | Media |
| 6 | **Sin lazy loading / code splitting** | Medio — bundle monolítico | Media |
| 7 | **Sin CI/CD** | Medio — deploys manuales | Media |
| 8 | **Estado con useState sin React Query/SWR** | Medio — sin caché ni deduplicación | Media |
| 9 | **Sub-vistas manejadas por estado, no por rutas** | Medio — sin deep linking | Media |
| 10 | **manifest.json con referencia a CoreUI** | Bajo — residual | Baja |
| 11 | **Sin `.env.example`** | Bajo — onboarding lento | Baja |
| 12 | **Socket.io duplicado por componente** | Medio — múltiples conexiones | Media |
| 13 | **Sin paginación en eventos** | Medio — carga de miles de registros | Media |
| 14 | **Mezcla de español/inglés en código** | Bajo — mantenibilidad | Baja |

---

## 3. Plan de Implementación por Fases

### Fase 1 — Correcciones Críticas (Semana 1-2)

#### 1.1 Agregar Error Boundary Global
**Archivos:** Crear `src/components/error-boundary.jsx`, modificar `AppRouter.jsx`
```jsx
// Envolver rutas en <ErrorBoundary fallback={<ErrorPage />}>
```
- Captura errores de renderizado no manejados
- Muestra una pantalla de error amigable con botón "Reintentar"

#### 1.2 Reemplazar `alert()` por Toasts/Modales
**Archivos:** `inventory-view.jsx`, `hr-view.jsx` (y cualquier otro que use `alert()`)
- Buscar `alert(` en todo el código fuente
- Reemplazar cada llamada por `toast.error()` o un diálogo de confirmación de Shadcn

#### 1.3 Eliminar Directivas `"use client"`
**Archivos:** Todos los `.jsx` que tengan `"use client"` al inicio
- Simplemente eliminar la línea — es un artefacto de Next.js sin efecto en Vite

#### 1.4 Limpiar `manifest.json`
- Reemplazar referencia a `"CoreUI-React"` por `"La Casona Frontend"`
- Actualizar nombres e íconos según la marca actual

#### 1.5 Agregar `.env.example`
**Archivo:** Crear `.env.example` en la raíz
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

---

### Fase 2 — Calidad y Estabilidad (Semana 3-4)

#### 2.1 Configurar Tests Unitarios (Vitest)
**Dependencias:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`
- Tests para servicios: `src/lib/services/*.test.js`
- Tests para componentes críticos: `Login`, `ProtectedRoute`, `AuthContext`
- Tests para `api-client.js` con mocks de fetch

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom msw jsdom
```

**Configurar en `vite.config.js`:**
```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js'
}
```

#### 2.2 Configurar Tests E2E (Playwright)
- Usar Playwright ya instalado en devDependencies
- Crear `e2e/` con tests de flujos críticos: login → dashboard → crear evento

```bash
npx playwright install
npx playwright init
```

#### 2.3 Agregar Husky + lint-staged
**Dependencias:** `husky`, `lint-staged`
- Ejecutar ESLint y tests en pre-commit
- Formatear con Prettier automáticamente

#### 2.4 Consolidar Conexiones Socket.io
**Archivo:** Modificar `NotificationBell.jsx` o crear un `SocketProvider`
- Usar un Context para mantener una única conexión Socket.io
- Reutilizar la misma instancia en toda la app

---

### Fase 3 — Nuevas Funcionalidades (Semana 5-8)

#### 3.1 Migración a TypeScript (gradual)
**Estrategia:** Migración progresiva archivo por archivo
- Configurar `tsconfig.json` con `allowJs: true` para permitir JS coexistente
- Empezar por `lib/` (servicios, api-client, utils)
- Luego migrar componentes críticos (auth, sidebar, dashboard)
- Dejar vistas completas para el final

**Archivos a crear:**
- `tsconfig.json`
- `src/types/api.d.ts` — tipos para respuestas del backend
- `src/types/models.d.ts` — interfaces para Evento, Cliente, Producto, etc.

#### 3.2 Agregar React Query / TanStack Query
**Dependencia:** `@tanstack/react-query`
- Reemplazar `useEffect` + `fetch` por `useQuery` y `useMutation`
- Beneficios: caché automática, deduplicación, refetch en background, stale-while-revalidate
- Reducción de ~70% del código boilerplate de fetching

#### 3.3 Lazy Loading con React.lazy + Suspense
**Archivo:** Modificar `AppRouter.jsx`
```jsx
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
```
- Reducir tamaño del bundle inicial en ~40-60%
- Agregar Skeleton loaders mientras cargan los módulos

#### 3.4 Sistema de Rutas para Sub-vistas
**Archivo:** Modificar `Home.jsx` y vistas
- Reemplazar `activeSection` por rutas anidadas: `/dashboard`, `/events`, `/crm`, etc.
- Agregar `react-router-dom` `<Outlet>` para layouts anidados
- Habilitar deep linking, botón "Atrás" del navegador, URLs compartibles

---

### Fase 4 — Optimización y DevOps (Semana 9-12)

#### 4.1 Configurar CI/CD (GitHub Actions)
**Archivo:** Crear `.github/workflows/deploy.yml`
```yaml
on: push to main
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [checkout, install, lint, test]
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps: [deploy to Netlify/Vercel]
```

#### 4.2 Dockerizar la Aplicación
**Archivos:** `Dockerfile`, `.dockerignore`, `docker-compose.yml`
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

#### 4.3 Paginación y Virtualización
- Implementar **paginación real** en eventos (actualmente carga todos)
- Usar `react-window` o `@tanstack/react-virtual` para listas largas
- Agregar búsqueda con debounce para evitar llamadas innecesarias

#### 4.4 Service Worker / PWA
- Agregar `vite-plugin-pwa`
- Cachear assets estáticos
- Permitir modo offline parcial
- Notificaciones push (futuro)

---

## 4. Nuevas Funcionalidades Propuestas

### 4.1 Reportes Avanzados (Exportación)
- Generar reportes en PDF con Chart.js incrustado
- Dashboard ejecutivo exportable
- Reportes de rentabilidad por evento
- Comparativas mes a mes

### 4.2 Módulo de Tareas y Checklists
- Checklist de preparación de eventos por fases
- Asignación de tareas a empleados
- Recordatorios automáticos
- Vista Kanban para seguimiento

### 4.3 Integración de Pagos en Línea
- Botón de pago en enlace (PayPal, Stripe)
- Registrar pagos parciales en ventas
- Estado de cuenta del cliente
- Conciliación automática

### 4.4 Módulo de Facturación Electrónica
- Generar facturas fiscales (según legislación venezolana)
- Envío automático de facturas por email
- Historial de facturación por cliente/evento


### 4.5 Calendario Compartido y Disponibilidad
- Vista de disponibilidad de empleados por fecha
- Calendario de eventos público (solo lectura)
- Integración con Google Calendar / Outlook
- Bloqueo automático de fechas ocupadas

### 4.6 Notificaciones Push y Email
- Recordatorios automáticos de eventos próximos
- Notificaciones al cliente cuando cambia el estado del evento
- Envío de confirmaciones y recordatorios por email
- Suscripción a notificaciones por tipo

### 4.7 Panel de Cliente (Portal)
- Inicio de sesión para clientes
- Ver historial de eventos contratados
- Descargar facturas y comprobantes
- Calificar servicios recibidos
- Solicitar cotizaciones

### 4.8 Módulo de Cotizaciones
- Crear cotizaciones con desglose de servicios
- Enviar cotización por email/whatsapp
- Aprobar/rechazar cotización desde el portal cliente
- Convertir cotización aprobada en evento confirmado



## 5. Recomendaciones Técnicas Adicionales

### 5.1 Arquitectura Sugerida a Futuro
```
src/
├── app/              # Providers, layouts, routing
├── pages/            # Page components (lazy loaded)
├── components/       # UI components (Shadcn + business)
├── features/         # Feature modules (self-contained)
│   ├── events/
│   ├── crm/
│   ├── inventory/
│   └── sales/
├── lib/              # Shared utilities
│   ├── api/          # API client + types
│   ├── hooks/        # Custom hooks (useQuery wrappers)
│   └── utils/        # cn, formatters, validators
├── types/            # Global TypeScript types
└── test/             # Test utilities, mocks
```

### 5.2 Monitoreo y Logging
- Agregar **Sentry** para monitoreo de errores en producción
- Analytics con **Plausible** o **PostHog** (autohosteables, respetan privacidad)

### 5.3 Checklist de Seguridad
- [ ] Mover tokens de localStorage a cookies httpOnly (vía backend) o usar httpOnly session cookies
- [ ] Validar todos los inputs con Zod tanto en frontend como backend
- [ ] Implementar rate limiting en endpoints críticos (login)
- [ ] Headers CSP, X-Frame-Options, X-Content-Type-Options
- [ ] Escapar correctamente HTML en cualquier renderizado de contenido dinámico

?
### 5.5 Accesibilidad
- Auditoría con axe-core o Lighthouse
- Agregar roles ARIA a componentes personalizados
- Navegación por teclado completa
- Contraste de colores suficiente (modo oscuro y claro)

---

## Resumen de Esfuerzo Estimado

| Fase | Duración | Áreas | Dependencias |
|------|----------|-------|-------------|
| Fase 1 | 1-2 semanas | Error Boundary, alert(), use client, manifest, .env.example | Ninguna |
| Fase 2 | 2 semanas | Vitest, Playwright, Husky, Socket.io | Fase 1 |
| Fase 3 | 4 semanas | TypeScript, React Query, Lazy Loading, Rutas | Fase 2 |
| Fase 4 | 4 semanas | CI/CD, Docker, Paginación, PWA | Fase 3 |

**Tiempo total estimado:** 11-12 semanas para implementación completa.  
**Prioridad recomendada:** Comenzar por Fase 1 (correcciones rápidas) mientras se planifica Fase 2 y 3 en paralelo.

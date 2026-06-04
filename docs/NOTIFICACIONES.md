# Documentación: Sistema de Notificaciones en Tiempo Real

Este documento resume los cambios y la arquitectura implementada para la campana de notificaciones de la aplicación (Frontend Casona), separando el sistema del antiguo flujo de "Toasts" molestos a un buzón interactivo.

## 1. Problema Original
Anteriormente, cuando un usuario realizaba una pre-reserva desde el sitio web público, el sistema disparaba una notificación visual (Toast) en toda la pantalla del administrador. El usuario reportó que estas notificaciones eran **"molestas"** e intrusivas en el flujo de trabajo continuo del panel de control.

## 2. Refactorización de Interfaz (UI)
Se reconstruyó por completo el componente `NotificationBell.jsx` para centralizar los avisos:
- **Campana Silenciosa:** Se implementó un icono de campana en la barra de navegación superior.
- **Badge de Conteo:** Se añadió un indicador visual (Badge rojo) que muestra la cantidad de notificaciones (pre-reservas) no leídas.
- **Buzón Desplegable (Popover):** Al hacer clic en la campana, ya no se redirige ni se bloquea la pantalla; en su lugar, se despliega un menú flotante (`Popover`) que contiene el historial reciente de notificaciones de reservas pendientes.
- **Scroll Infinito (ScrollArea):** Las notificaciones dentro del buzón están contenidas en un área con desplazamiento para asegurar que el menú no ocupe toda la pantalla en caso de haber múltiples reservas.

## 3. Integración en Tiempo Real (Socket.io)
El componente escucha silenciosamente en segundo plano usando `socket.io-client`:
- Al montarse el componente, se conecta al servidor backend (`http://localhost:3000`).
- Se suscribe al evento `new_reservation`.
- Cuando el backend emite una nueva reserva web, la campana recibe la data en tiempo real (`socket.on('new_reservation', data)`).
- La nueva notificación se empuja al inicio de la lista local (estado `notifications`) y se incrementa el contador de "no leídas" automáticamente, sin recargar la página.

## 4. Resolución de Conflictos (HMR y Vite)
Durante la implementación inicial, se encontró un problema crítico con el sistema de módulos de Vite (HMR) y las dependencias (Error: `UNLOADABLE_DEPENDENCY`).
- **Causa:** El archivo original del componente estaba en `src/components/NotificationBell.jsx`, pero los alias del proyecto (`@/components`) en `vite.config.js` apuntaban a la carpeta `components` ubicada en la raíz del proyecto, fuera de `src`.
- **Solución:** Se reubicó exitosamente el archivo a `Frontend Casona/components/NotificationBell.jsx`. Esto solucionó permanentemente las recargas en caliente y los errores de importación en el archivo `Header` y otros layouts.

## 5. Próximos Pasos Recomendados (Opcional)
Actualmente, las notificaciones viven en la memoria local (estado de React). Si recargas la página, la campana vuelve a cero. Para mejorarlo en el futuro, se podría:
1. Crear una tabla `Notifications` en la base de datos PostgreSQL.
2. Hacer un `GET /api/notifications` cada vez que el panel cargue para recuperar el historial persistente de eventos.

## 6. Guía para Implementar con un Agente AI (Prompting)
Si un compañero desea que un agente de IA implemente este mismo sistema en su proyecto, puede proporcionarle el siguiente prompt o instrucción como punto de partida:

> **Prompt sugerido para el Agente AI:**
> "Necesito implementar un sistema de notificaciones en tiempo real para mi panel de administración en React. Por favor haz lo siguiente:
> 1. **UI (Interfaz):** Construye un componente `NotificationBell` para la barra de navegación superior. Debe tener un icono de campana y un 'Badge' (insignia roja) que muestre el número de notificaciones no leídas.
> 2. **Buzón Desplegable:** Al hacer clic en la campana, despliega un menú flotante tipo `Popover` (con scroll interno si es necesario) para ver el historial de notificaciones recientes. **No** uses alertas (toasts) globales que interrumpan toda la pantalla ni redirijas a otra página.
> 3. **WebSockets:** Usa `socket.io-client` (o la librería en tiempo real que usemos) para conectarte al servidor y escuchar eventos en segundo plano de forma silenciosa (ej: evento `new_notification`).
> 4. **Actualización de Estado:** Cuando el socket reciba un evento, agrega la nueva notificación al inicio del estado local e incrementa el contador del badge automáticamente, todo sin recargar la página."

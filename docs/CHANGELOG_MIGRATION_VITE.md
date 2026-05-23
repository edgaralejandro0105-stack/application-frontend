# CHANGELOG: Migración a Vite (SPA React)

Esta refactorización migra el proyecto desde Next.js con TypeScript a una Single Page Application (SPA) pura usando Vite y JavaScript estándar.

## Paquetes Eliminados
- `next`
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `eslint-config-next`

## Paquetes Instalados
- `vite`
- `@vitejs/plugin-react`
- `react-router-dom`
- `esbuild` (utilizado temporalmente para la transpilación de tipos TS)

## Cambios Estructurales
1. **Configuración de Vite:** Creación de `vite.config.js` e `index.html` en la raíz.
2. **Variables de Entorno:** Todas las variables `NEXT_PUBLIC_` fueron renombradas a `VITE_` y actualizadas a `import.meta.env` en la lógica interna (ej. `lib/api-client.js`).
3. **Enrutamiento SPA:** Se eliminó la carpeta `app/` basada en SSR/Ruteo de Next.js. Las vistas fueron migradas a `src/pages/` y registradas en `src/AppRouter.jsx` usando `react-router-dom` v6+.
4. **Degradación de TypeScript:** Todos los archivos `.ts` y `.tsx` fueron transpilados a `.js` y `.jsx` mediante `esbuild`, removiendo las declaraciones de tipos e interfaces y eliminando `tsconfig.json`.
5. **Componentes Next.js:** Se sustituyeron los imports de `next/navigation` (`useRouter` a `useNavigate`) y las instancias de `<Image>` de `next/image` por etiquetas estándar `<img>`.

## Scripts de Arranque
Para ejecutar la aplicación en el nuevo entorno:

```bash
# Desarrollo local
npm run dev

# Compilación de producción
npm run build

# Previsualizar producción
npm run start
```

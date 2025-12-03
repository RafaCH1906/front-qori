# Configuración para Cloudflare Pages

## Problema del Error 404 en Refresh

El error 404 que ves al refrescar páginas como `/match/40` o `/profile` ocurre porque Cloudflare Pages busca archivos físicos en esas rutas. Como es una SPA (Single Page Application), todas las rutas deben redirigir a `index.html` para que Expo Router maneje el enrutamiento.

## Solución Implementada

### 1. Archivos de Configuración Creados

- **`public/_redirects`**: Redirige todas las rutas a index.html (SPA routing)
- **`_headers`**: Agrega headers de seguridad básicos

### 2. Script de Build

Se agregó el script `build:web` en package.json:
```bash
npm run build:web
```

Este comando genera una build optimizada para producción en la carpeta `dist/`.

## Configuración en Cloudflare Pages

Cuando configures tu proyecto en Cloudflare Pages, usa estos ajustes:

### Build Configuration:
- **Framework preset**: `None` o `Create React App`
- **Build command**: `npm run build:web`
- **Build output directory**: `dist`

### Environment Variables (si es necesario):
Agrega las variables de entorno que necesites, por ejemplo:
- `EXPO_PUBLIC_API_URL`: URL de tu API backend
- Cualquier otra variable que uses en tu app

## Cómo Desplegar

1. **Conecta tu repositorio** a Cloudflare Pages
2. **Configura el proyecto** con los valores mencionados arriba
3. **Haz push** de estos cambios a tu repositorio
4. Cloudflare Pages detectará automáticamente los cambios y comenzará el build

## Verificación

Después del despliegue:
1. Navega a cualquier ruta de tu app (ej: `tu-dominio.pages.dev/match/40`)
2. Refresca la página (F5)
3. La página debería cargar correctamente sin error 404

## Durante Desarrollo Local

El error 404 en refresh **es normal** durante el desarrollo con `expo start --web`. Para evitarlo:
- Simplemente navega de vuelta a la página principal (`http://localhost:8081/`)
- Luego navega a través de la app (usando los enlaces)

## Archivos Modificados

- ✅ `package.json`: Agregado script `build:web`
- ✅ `public/_redirects`: Configuración de SPA routing
- ✅ `_headers`: Headers de seguridad
- ✅ `vercel.json`: (opcional, por si cambias de hosting)
- ✅ `web/_redirects`: (backup, Cloudflare usa `public/_redirects`)

## Notas Adicionales

- El archivo `public/_redirects` es el que Cloudflare Pages usará automáticamente
- No necesitas configuración adicional en el dashboard de Cloudflare
- Los cambios se aplicarán automáticamente en el próximo deploy

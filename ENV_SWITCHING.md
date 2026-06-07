# 🔄 Cambio entre Entornos (Local / Cloudflare)

Este documento explica cómo cambiar entre modo de desarrollo local y túneles de Cloudflare.

## 📋 Modos Disponibles

### 1️⃣ Modo LOCAL (Desarrollo)
- Backend: `http://localhost:3001`
- Para desarrollo local sin necesidad de túneles
- Más rápido y no requiere conexión a internet

### 2️⃣ Modo CLOUDFLARE (Túneles)
- Backend: URL del túnel de Cloudflare
- Para pruebas con túneles públicos
- Permite acceso desde otros dispositivos/redes

## 🚀 Cómo Cambiar de Modo

### Opción 1: Usando el Script (Recomendado)

```bash
# Cambiar a modo LOCAL
cd client
switch-env.bat local

# Cambiar a modo CLOUDFLARE
cd client
switch-env.bat cloudflare
```

### Opción 2: Manualmente

Edita el archivo `.env.local` y cambia la línea:

```bash
# Para modo LOCAL:
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Para modo CLOUDFLARE:
NEXT_PUBLIC_BASE_URL=https://tu-tunel.trycloudflare.com
```

## ⚠️ IMPORTANTE

**Después de cambiar el modo, DEBES reiniciar el servidor de Next.js:**

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## 🔧 Configuración de Túnel Cloudflare

Cuando crees un nuevo túnel de Cloudflare, actualiza la URL en `.env.local`:

```bash
NEXT_PUBLIC_BASE_URL_CLOUDFLARE=https://nueva-url.trycloudflare.com
```

## 📊 Estado Actual

Para ver qué modo está activo, revisa `.env.local`:

```bash
NEXT_PUBLIC_ENV_MODE=local         # ← Modo activo
NEXT_PUBLIC_BASE_URL=http://...    # ← URL activa
```

## 🎯 Ejemplo de Flujo de Trabajo

### Desarrollo Local:
```bash
1. switch-env.bat local
2. Reiniciar npm run dev
3. Desarrollar y probar en localhost
```

### Pruebas con Túnel:
```bash
1. Iniciar túnel Cloudflare
2. Copiar URL del túnel
3. Actualizar NEXT_PUBLIC_BASE_URL_CLOUDFLARE en .env.local
4. switch-env.bat cloudflare
5. Reiniciar npm run dev
6. Probar con la URL del túnel
```

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- ✅ Verifica que el backend esté corriendo en el puerto correcto
- ✅ Revisa que `.env.local` tenga la URL correcta
- ✅ Reinicia el servidor de Next.js después de cambiar `.env.local`

### Error ERR_NAME_NOT_RESOLVED
- ✅ La URL de Cloudflare en `.env.local` está desactualizada
- ✅ El túnel de Cloudflare no está corriendo
- ✅ Cambia a modo local con `switch-env.bat local`

### Los cambios no se aplican
- ✅ Los cambios en `.env.local` requieren reiniciar Next.js
- ✅ Limpia la caché del navegador (Ctrl+Shift+R)

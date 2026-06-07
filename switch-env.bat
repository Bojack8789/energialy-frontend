@echo off
REM ============================================================================
REM Script para cambiar entre modo LOCAL y CLOUDFLARE
REM ============================================================================

if "%1"=="local" (
    echo.
    echo [92m✓ Cambiando a modo LOCAL...[0m
    echo.
    (
        echo # ============================================================================
        echo # ENERGIALY - CLIENT Environment Variables
        echo # ============================================================================
        echo.
        echo # ── Modo de Desarrollo ──────────────────────────────────────────────────────
        echo # Cambia entre 'local' y 'cloudflare' según necesites
        echo NEXT_PUBLIC_ENV_MODE=local
        echo.
        echo # ── Backend API URL ─────────────────────────────────────────────────────────
        echo # Para desarrollo local (cuando NEXT_PUBLIC_ENV_MODE=local^)
        echo NEXT_PUBLIC_BASE_URL_LOCAL=http://localhost:3001
        echo.
        echo # Para túnel Cloudflare (cuando NEXT_PUBLIC_ENV_MODE=cloudflare^)
        echo # Actualiza esta URL cuando crees un nuevo túnel
        echo NEXT_PUBLIC_BASE_URL_CLOUDFLARE=https://threatening-coordinates-musician-tracked.trycloudflare.com
        echo.
        echo # URL activa (usa la del modo seleccionado^)
        echo NEXT_PUBLIC_BASE_URL=http://localhost:3001
    ) > .env.local
    echo [92m✓ Modo LOCAL activado![0m
    echo [93m  Backend URL: http://localhost:3001[0m
    echo.
    echo [96mℹ Recuerda reiniciar el servidor de Next.js (npm run dev^)[0m
    echo.
) else if "%1"=="cloudflare" (
    echo.
    echo [92m✓ Cambiando a modo CLOUDFLARE...[0m
    echo.
    (
        echo # ============================================================================
        echo # ENERGIALY - CLIENT Environment Variables
        echo # ============================================================================
        echo.
        echo # ── Modo de Desarrollo ──────────────────────────────────────────────────────
        echo # Cambia entre 'local' y 'cloudflare' según necesites
        echo NEXT_PUBLIC_ENV_MODE=cloudflare
        echo.
        echo # ── Backend API URL ─────────────────────────────────────────────────────────
        echo # Para desarrollo local (cuando NEXT_PUBLIC_ENV_MODE=local^)
        echo NEXT_PUBLIC_BASE_URL_LOCAL=http://localhost:3001
        echo.
        echo # Para túnel Cloudflare (cuando NEXT_PUBLIC_ENV_MODE=cloudflare^)
        echo # Actualiza esta URL cuando crees un nuevo túnel
        echo NEXT_PUBLIC_BASE_URL_CLOUDFLARE=https://threatening-coordinates-musician-tracked.trycloudflare.com
        echo.
        echo # URL activa (usa la del modo seleccionado^)
        echo NEXT_PUBLIC_BASE_URL=https://threatening-coordinates-musician-tracked.trycloudflare.com
    ) > .env.local
    echo [92m✓ Modo CLOUDFLARE activado![0m
    echo [93m  Backend URL: https://threatening-coordinates-musician-tracked.trycloudflare.com[0m
    echo.
    echo [96mℹ Recuerda reiniciar el servidor de Next.js (npm run dev^)[0m
    echo.
) else (
    echo.
    echo [91m✗ Uso incorrecto[0m
    echo.
    echo Uso: switch-env.bat [local^|cloudflare]
    echo.
    echo Ejemplos:
    echo   switch-env.bat local        - Cambia a modo desarrollo local
    echo   switch-env.bat cloudflare   - Cambia a modo túnel Cloudflare
    echo.
)

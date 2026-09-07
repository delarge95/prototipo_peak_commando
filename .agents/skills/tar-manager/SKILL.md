---
name: tar-manager
description: >-
  Abre, inspecciona, extrae y sincroniza archivos TAR (como workspace.tar descargados de entornos sandbox o IDEs web) directamente dentro del repositorio sin necesidad de programas externos fuera de Antigravity, protegiendo siempre la configuración de Git y facilitando el commit y push a GitHub.
---

# TAR Manager Skill para Antigravity

Este complemento permite a Antigravity manejar flujos de trabajo con archivos `.tar` (por ejemplo `workspace.tar` descargados de sandboxes externos como Qwen, CodeSandbox o v0), extrayéndolos de forma segura, sincronizando los archivos de código sin alterar la configuración de Git del repositorio local y preparando los cambios para commit y push.

## Características

1. **Sin dependencias externas**: Utiliza las utilidades nativas (`tar` / `bsdtar` de Windows y PowerShell) integradas en el entorno.
2. **Protección de Git**: Aísla y previene que un `.git` empaquetado dentro del archivo `.tar` sobreescriba el remote `origin`, credenciales o ramas locales.
3. **Limpieza de artefactos**: Corrige problemas comunes de exportación (como bloques markdown accidentales en `.gitignore`).
4. **Sincronización automatizada**: Compara y copia archivos nuevos/modificados directamente al árbol de trabajo.

## Estructura de Scripts

- `scripts/sync-tar.ps1`: Script automatizado para extraer un archivo `.tar` en una zona segura de staging y sincronizar el contenido con el repositorio actual.

## Procedimiento de Uso

1. **Inspeccionar contenido del TAR**:
   ```powershell
   tar -tf "ruta\al\archivo.tar"
   ```

2. **Ejecutar sincronización**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/tar-manager/scripts/sync-tar.ps1 -TarPath "D:\Downloads\workspace.tar"
   ```

3. **Verificar estado de Git**:
   ```powershell
   git status
   git diff
   ```

4. **Commitear y pushear**:
   ```powershell
   git add -A
   git commit -m "feat: sincronizar cambios desde workspace.tar"
   git push origin main
   ```

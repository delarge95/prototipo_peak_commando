param (
    [Parameter(Mandatory = $false)]
    [string]$TarPath = 'D:\Downloads\workspace.tar',

    [Parameter(Mandatory = $false)]
    [string]$TargetRepo = 'D:\Downloads\prototipo_peak_commando'
)

Write-Host '=== Antigravity TAR Manager ===' -ForegroundColor Cyan
Write-Host "Archivo TAR: $TarPath"
Write-Host "Repositorio destino: $TargetRepo"

if (-not (Test-Path $TarPath)) {
    Write-Error "El archivo '$TarPath' no existe."
    exit 1
}

$tempDir = Join-Path $env:TEMP ('antigravity_tar_' + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Write-Host "Extrayendo en staging: $tempDir" -ForegroundColor Yellow

try {
    tar -xf $TarPath -C $tempDir
    if ($LASTEXITCODE -ne 0) {
        Write-Error 'Fallo al descomprimir el archivo TAR'
        exit $LASTEXITCODE
    }

    Write-Host 'Extraccion exitosa. Sincronizando archivos hacia el repositorio...' -ForegroundColor Green

    $stagingFiles = Get-ChildItem -Path $tempDir -Recurse -File -Force | Where-Object {
        $_.FullName -notmatch '[\\/]\.git([\\/]|$)'
    }

    foreach ($file in $stagingFiles) {
        $relPath = $file.FullName.Substring($tempDir.Length).TrimStart('\', '/')
        
        if ($relPath -eq '.git' -or $relPath.StartsWith('.git\') -or $relPath.StartsWith('.git/')) { continue }

        $destPath = Join-Path $TargetRepo $relPath
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        if ($relPath -eq '.gitignore') {
            $rawLines = Get-Content -Path $file.FullName
            $cleaned = @()
            $forbiddenPatterns = @('*.js', '*.ts', '*.tsx', '*.jsx', '*.css', '*.scss', '*.sass', '*.less')
            foreach ($line in $rawLines) {
                $trimmed = $line.Trim()
                if ($trimmed.StartsWith('```')) { continue }
                if ($forbiddenPatterns -contains $trimmed) { continue }
                $cleaned += $line
            }
            $essentials = @('node_modules/', 'dist/', 'build/', '.env', '.env.local', '*.log')
            foreach ($item in $essentials) {
                if ($cleaned -notcontains $item) {
                    $cleaned += $item
                }
            }
            $cleaned | Set-Content -Path $destPath -Encoding utf8
            Write-Host "  -> Sincronizado y saneado: $relPath" -ForegroundColor Magenta
        } else {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "  -> Copiado: $relPath"
        }
    }

    Write-Host 'Sincronizacion completada con exito.' -ForegroundColor Green
} finally {
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

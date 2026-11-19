# scripts/make-fix-zip.ps1
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = "d:\Desktop\Pandu"
$dst = "d:\Desktop\Pandu\pandu-fix-pass.zip"

if (Test-Path $dst) {
    Remove-Item $dst -Force
}

$guid = [Guid]::NewGuid().ToString()
$tmp = Join-Path $env:TEMP ("pandu_zip_" + $guid)
New-Item -ItemType Directory -Path $tmp | Out-Null

Get-ChildItem -Path $sourceDir -Recurse | Where-Object {
    $_.FullName -notmatch '[\\/]node_modules' -and
    $_.FullName -notmatch '[\\/]\.git' -and
    $_.FullName -notmatch '\.zip$' -and
    $_.FullName -notmatch 'temp_test_storage'
} | ForEach-Object {
    $rel = $_.FullName.Substring($sourceDir.Length + 1)
    $target = Join-Path $tmp $rel
    if ($_.PSIsContainer) {
        if (-not (Test-Path $target)) {
            New-Item -ItemType Directory -Path $target | Out-Null
        }
    } else {
        $parent = Split-Path $target -Parent
        if (-not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent | Out-Null
        }
        Copy-Item $_.FullName -Destination $target
    }
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $dst)
Remove-Item -Path $tmp -Recurse -Force

Write-Host "Created successfully:"
Get-Item $dst | Select-Object Name, Length, LastWriteTime

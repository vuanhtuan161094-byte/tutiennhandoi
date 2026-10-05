param(
    [Parameter(Mandatory=$true)][string[]]$Path,
    [int]$Width = 390,
    [int]$Height = 844,
    [string]$ReportPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$results = @()
foreach ($imagePath in $Path) {
    $resolved = (Resolve-Path -LiteralPath $imagePath).Path
    $bitmap = [Drawing.Bitmap]::new($resolved)
    try {
        $colors = New-Object 'Collections.Generic.HashSet[int]'
        $samples = 0; $bright = 0; $opaque = 0; $min = 255.0; $max = 0.0
        for ($y = 0; $y -lt $bitmap.Height; $y += 4) {
            for ($x = 0; $x -lt $bitmap.Width; $x += 4) {
                $pixel = $bitmap.GetPixel($x, $y)
                $light = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B)) * $pixel.A / 255.0
                $min = [Math]::Min($min, $light); $max = [Math]::Max($max, $light)
                if ($light -gt 25.5) { $bright++ }
                if ($pixel.A -gt 0) { $opaque++ }
                [void]$colors.Add($pixel.ToArgb()); $samples++
            }
        }
        $valid = $bitmap.Width -eq $Width -and $bitmap.Height -eq $Height -and $samples -gt 0 -and $opaque -gt 0 -and $bright / $samples -ge 0.002 -and $max - $min -gt 5.1 -and $colors.Count -ge 8
        $results += [pscustomobject]@{path=$resolved;valid=$valid;width=$bitmap.Width;height=$bitmap.Height;bytes=(Get-Item -LiteralPath $resolved).Length;samples=$samples;opaque=$opaque;bright=$bright;colors=$colors.Count;range=$max-$min}
    } finally { $bitmap.Dispose() }
}
if ($ReportPath) { $results | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 -LiteralPath $ReportPath }
$results | Format-Table valid,width,height,bytes,opaque,bright,colors,range -AutoSize
if (@($results | Where-Object { -not $_.valid }).Count -gt 0) { throw 'Visual screenshot FAIL: wrong dimensions, transparent, black or uniform render.' }
Write-Host 'VISUAL SCREENSHOT PIXELS: PASS'

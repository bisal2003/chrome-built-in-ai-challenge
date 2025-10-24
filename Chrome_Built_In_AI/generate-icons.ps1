# Icon Generator for ContextRecall
# Creates simple SVG-based placeholder icons

Write-Host "Generating placeholder icons..." -ForegroundColor Cyan
Write-Host ""

$iconsPath = Join-Path $PSScriptRoot "backend\icons"

# Ensure icons directory exists
if (-not (Test-Path $iconsPath)) {
    New-Item -ItemType Directory -Path $iconsPath | Out-Null
}

# SVG icon template (brain emoji style)
$svgTemplate = @'
<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{0}" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad1)"/>
  <circle cx="50" cy="50" r="35" fill="rgba(255,255,255,0.9)"/>
  <text x="50" y="65" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="#667eea">🧠</text>
</svg>
'@

$sizes = @(16, 32, 48, 128)

foreach ($size in $sizes) {
    $svgContent = $svgTemplate -f $size
    $svgPath = Join-Path $iconsPath "icon$size.svg"
    $svgContent | Out-File -FilePath $svgPath -Encoding UTF8
    Write-Host "Created icon$size.svg" -ForegroundColor Green
}

Write-Host ""
Write-Host "SVG icons created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Chrome extensions prefer PNG icons." -ForegroundColor Yellow
Write-Host "Please convert these SVG files to PNG using:" -ForegroundColor Yellow
Write-Host "  1. Online converter: https://svgtopng.com/" -ForegroundColor White
Write-Host "  2. Or use an image editor like GIMP or Photoshop" -ForegroundColor White
Write-Host ""
Write-Host "For quick testing, you can also:" -ForegroundColor Yellow
Write-Host "  1. Update manifest.json to use .svg instead of .png" -ForegroundColor White
Write-Host "  2. Or download free icons from flaticon website" -ForegroundColor White
Write-Host ""

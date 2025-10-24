# ContextRecall Setup Script
# Downloads required libraries for the extension

Write-Host "================================" -ForegroundColor Cyan
Write-Host "ContextRecall Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$libPath = Join-Path $backendPath "lib"

# Create lib directory if it doesn't exist
if (-not (Test-Path $libPath)) {
    New-Item -ItemType Directory -Path $libPath | Out-Null
    Write-Host "Created lib directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "Downloading required libraries..." -ForegroundColor Yellow
Write-Host ""

# Download Readability.js
Write-Host "1. Downloading Readability.js..." -ForegroundColor White
try {
    $readabilityUrl = "https://raw.githubusercontent.com/mozilla/readability/main/Readability.js"
    $readabilityPath = Join-Path $libPath "Readability.js"
    Invoke-WebRequest -Uri $readabilityUrl -OutFile $readabilityPath -UseBasicParsing
    Write-Host "   Readability.js downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to download Readability.js" -ForegroundColor Red
    Write-Host "   Please download manually from: https://github.com/mozilla/readability/blob/main/Readability.js" -ForegroundColor Yellow
}

Write-Host ""

# Download Fuse.js
Write-Host "2. Downloading Fuse.js..." -ForegroundColor White
try {
    $fuseUrl = "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js"
    $fusePath = Join-Path $libPath "fuse.min.js"
    Invoke-WebRequest -Uri $fuseUrl -OutFile $fusePath -UseBasicParsing
    Write-Host "   Fuse.js downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to download Fuse.js" -ForegroundColor Red
    Write-Host "   Please download manually from: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add icon images to backend/icons/ folder" -ForegroundColor White
Write-Host "   - icon16.png (16x16px)" -ForegroundColor Gray
Write-Host "   - icon32.png (32x32px)" -ForegroundColor Gray
Write-Host "   - icon48.png (48x48px)" -ForegroundColor Gray
Write-Host "   - icon128.png (128x128px)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Enable Chrome AI flags at chrome://flags:" -ForegroundColor White
Write-Host "   - optimization-guide-on-device-model" -ForegroundColor Gray
Write-Host "   - prompt-api-for-gemini-nano" -ForegroundColor Gray
Write-Host "   - summarization-api-for-gemini-nano" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Load extension in Chrome:" -ForegroundColor White
Write-Host "   - Go to chrome://extensions" -ForegroundColor Gray
Write-Host "   - Enable Developer mode" -ForegroundColor Gray
Write-Host "   - Click Load unpacked" -ForegroundColor Gray
Write-Host "   - Select the backend folder" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy browsing!" -ForegroundColor Cyan

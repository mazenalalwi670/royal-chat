# تشغيل التطبيق على المحاكي - سكريبت كامل
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  تشغيل التطبيق على محاكي Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. الحصول على IP المحلي
Write-Host "[1] جاري الحصول على IP المحلي..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    $ipAddress = "192.168.1.104"
    Write-Host "⚠️  لم يتم العثور على IP، استخدام: $ipAddress" -ForegroundColor Yellow
} else {
    Write-Host "✓ IP المحلي: $ipAddress" -ForegroundColor Green
}
Write-Host ""

# 2. إنشاء ملف .env.local
Write-Host "[2] جاري إنشاء ملف .env.local..." -ForegroundColor Yellow
$envContent = @"
NEXT_PUBLIC_APP_URL=http://$ipAddress:4000
NEXT_PUBLIC_WS_URL=ws://$ipAddress:4000
ALLOWED_ORIGINS=http://$ipAddress:4000
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -Force
Write-Host "✓ تم إنشاء .env.local" -ForegroundColor Green
Write-Host ""

# 3. التحقق من أن التطبيق لا يعمل
Write-Host "[3] التحقق من المنفذ 4000..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  المنفذ 4000 مستخدم، جاري إيقاف العملية..." -ForegroundColor Yellow
    $processId = ($portInUse | Select-Object -First 1).OwningProcess
    if ($processId) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ تم إيقاف العملية" -ForegroundColor Green
    }
} else {
    Write-Host "✓ المنفذ 4000 متاح" -ForegroundColor Green
}
Write-Host ""

# 4. البحث عن Android Emulator
Write-Host "[4] البحث عن Android Emulator..." -ForegroundColor Yellow
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"
$emulatorExists = Test-Path $emulatorPath

if (-not $emulatorExists) {
    $emulatorPath = "$env:ProgramFiles\Android\Android Studio\emulator\emulator.exe"
    $emulatorExists = Test-Path $emulatorPath
}

if ($emulatorExists) {
    Write-Host "✓ تم العثور على Emulator: $emulatorPath" -ForegroundColor Green
    
    # الحصول على قائمة المحاكيات
    Write-Host "[5] جاري الحصول على قائمة المحاكيات..." -ForegroundColor Yellow
    $avds = & $emulatorPath -list-avds 2>$null
    
    if ($avds -and $avds.Count -gt 0) {
        Write-Host "✓ تم العثور على المحاكيات التالية:" -ForegroundColor Green
        $avds | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
        Write-Host ""
        
        # استخدام أول محاكي
        $firstAvd = $avds[0]
        Write-Host "[6] جاري تشغيل المحاكي: $firstAvd" -ForegroundColor Yellow
        Write-Host ""
        
        # تشغيل المحاكي في الخلفية
        Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $firstAvd -WindowStyle Minimized
        Write-Host "✓ تم تشغيل المحاكي" -ForegroundColor Green
        Write-Host "  انتظر 30-60 ثانية حتى يفتح المحاكي..." -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "⚠️  لم يتم العثور على محاكيات. يرجى إنشاء محاكي من Android Studio." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "⚠️  لم يتم العثور على Android Emulator." -ForegroundColor Yellow
    Write-Host "  يرجى تثبيت Android Studio من: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host ""
}

# 5. تشغيل التطبيق
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  معلومات الاتصال:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  على الكمبيوتر:" -ForegroundColor White
Write-Host "  http://localhost:4000" -ForegroundColor Green
Write-Host ""
Write-Host "  على المحاكي (IP المحلي):" -ForegroundColor White
Write-Host "  http://$ipAddress:4000" -ForegroundColor Green
Write-Host ""
Write-Host "  على محاكي Android Studio:" -ForegroundColor White
Write-Host "  http://10.0.2.2:4000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[7] جاري تشغيل التطبيق..." -ForegroundColor Yellow
Write-Host "  اضغط Ctrl+C لإيقاف التطبيق" -ForegroundColor Yellow
Write-Host ""

# تشغيل التطبيق
npm run dev


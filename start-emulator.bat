@echo off
chcp 65001 >nul
echo ========================================
echo   تشغيل التطبيق على محاكي الهاتف
echo ========================================
echo.

echo [1] جاري الحصول على IP المحلي...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo ✓ IP المحلي: %IP%
echo.

echo [2] جاري إنشاء ملف .env.local...
echo.

(
echo NEXT_PUBLIC_APP_URL=http://%IP%:4000
echo NEXT_PUBLIC_WS_URL=ws://%IP%:4000
echo ALLOWED_ORIGINS=http://%IP%:4000
) > .env.local

echo ✓ تم إنشاء .env.local
echo.

echo ========================================
echo   الرابط للاستخدام في المحاكي:
echo ========================================
echo.
echo   http://%IP%:4000
echo.
echo ========================================
echo.

echo [3] جاري تشغيل التطبيق...
echo.
echo   اضغط Ctrl+C لإيقاف التطبيق
echo.

npm run dev


@echo off
echo ============================================
echo   ChaShan Dev Environment Startup
echo ============================================
echo.

set MYSQL_HOME=C:\Users\20312\chashan-mysql\mysql-8.0.43-winx64
set MYSQL_INI=C:\Users\20312\chashan-mysql\my.ini
set BACKEND=C:\Users\20312\Desktop\yuya\大创项目\chashan-backend
set NODE=C:\Users\20312\.workbuddy\binaries\node\versions\22.22.2\node.exe

echo [Step 1] Check MySQL ...
if not exist "%MYSQL_HOME%\bin\mysqld.exe" (
    echo   [ERROR] mysqld.exe not found: %MYSQL_HOME%\bin\mysqld.exe
    pause
    exit /b 1
)
if not exist "%NODE%" (
    echo   [ERROR] node.exe not found: %NODE%
    pause
    exit /b 1
)

netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo   MySQL already running
) else (
    echo   Start MySQL ...
    start "MySQL" /MIN "%MYSQL_HOME%\bin\mysqld.exe" --defaults-file="%MYSQL_INI%" --console
    echo   Wait 15s for MySQL ready ...
    timeout /t 15 /nobreak >nul
)

echo [Step 2] Start backend ...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo   Backend already running: http://127.0.0.1:3001
) else (
    cd /d "%BACKEND%"
    start "chashan-backend" /MIN "%NODE%" src\server.js
    timeout /t 5 /nobreak >nul
    echo   Backend started: http://127.0.0.1:3001
)

echo [Step 3] Health check ...
curl -s http://127.0.0.1:3001/api/health
echo.
echo.
echo ============================================
echo   DONE. Open WeChat DevTools and import:
echo   C:\Users\20312\Desktop\yuya\大创项目\大学生创新创业项目_extracted
echo   Remember to check: Settings - Project Settings -
echo   Do not verify domain name and TLS certificate
echo ============================================
pause
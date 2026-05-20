@echo off
cd /d "%~dp0"
echo Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 .*LISTENING"') do set PID=%%a
if defined PID (
  echo Port 3000 is already in use by PID %PID%. Stopping existing process...
  taskkill /PID %PID% /F >nul 2>&1
)
echo Starting backend server...
start "KAABE Statio Server" cmd /k "npm start"
timeout /t 3 >nul
start "" "http://localhost:3000/login.html"
exit

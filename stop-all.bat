@echo off
REM Stop all Urban Threads dev processes
echo Stopping MongoDB (if started by this project)...
net stop MongoDB >nul 2>&1

echo Stopping Node servers (UT-Server / UT-Client windows)...
taskkill /FI "WINDOWTITLE eq UT-Server*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UT-Client*" /T /F >nul 2>&1

echo Stopping any stray node.exe on ports 5000 / 5173...
for /f "tokens=5" %%P in ('netstat -aon ^| findstr ":5000 :5173" ^| findstr LISTENING') do (
  taskkill /PID %%P /F >nul 2>&1
)

echo Done.
exit /b 0
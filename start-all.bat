@echo off
REM ============================================================
REM Urban Threads — start backend + frontend together
REM ============================================================
REM Adds Node to PATH for this shell (no admin needed),
REM then launches the server and Vite client in two windows.
REM ============================================================

setlocal
set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

if not exist "%NODE_DIR%\node.exe" (
  echo [ERROR] Node.js not found at %NODE_DIR%.
  echo Please install Node.js 20+ from https://nodejs.org and re-run.
  pause
  exit /b 1
)

REM Check MongoDB
sc query MongoDB >nul 2>&1
if errorlevel 1 (
  echo [WARN] MongoDB service not registered. Trying to start mongod manually...
  start "MongoDB" cmd /k "mongod --dbpath %USERPROFILE%\mongo-data"
) else (
  net start MongoDB >nul 2>&1
)

set "ROOT=%~dp0"
echo.
echo [0/2] Route lint (guards against blank-screen regressions) ...
cd /d %ROOT%client
call npm run lint:routes --silent
if errorlevel 1 (
  echo.
  echo [ERROR] Route lint failed. Fix the issues above before starting the dev server.
  echo Press any key to continue anyway, or Ctrl+C to abort.
  pause >nul
)
echo.

echo [0.5/2] Cart regression test (against the live server) ...
cd /d %ROOT%server
call npm run test:cart --silent
if errorlevel 1 (
  echo.
  echo [ERROR] Cart regression test failed. Cart will not work.
  echo Press any key to continue anyway, or Ctrl+C to abort.
  pause >nul
)
echo.

echo [1/2] Starting backend on http://localhost:5000 ...
start "UT-Server" cmd /k "cd /d %ROOT%server && set PATH=%NODE_DIR%;%%PATH%% && npm run dev"

timeout /t 5 /nobreak >nul

echo [2/2] Starting frontend on http://localhost:5173 ...
start "UT-Client" cmd /k "cd /d %ROOT%client && set PATH=%NODE_DIR%;%%PATH%% && npm run dev"

echo.
echo ============================================================
echo  Backend  -> http://localhost:5000/api/health
echo  Frontend -> http://localhost:5173
echo  Admin    -> admin@urbanthreads.com / Admin@123
echo  Demo user-> demo@urbanthreads.com / Demo@123
echo ============================================================
echo.
endlocal
exit /b 0
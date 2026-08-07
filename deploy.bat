@echo off
REM ============================================================
REM Urban Threads — deploy helper
REM ============================================================
REM Guides you through the GitHub + Vercel deploy process.
REM Assumes you have:
REM   - Git installed (https://git-scm.com/download/win)
REM   - A GitHub account
REM   - A Vercel account (https://vercel.com)
REM ============================================================

setlocal
set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git is not installed. Install from https://git-scm.com/download/win and re-run.
  pause
  exit /b 1
)

if not exist "%NODE_DIR%\node.exe" (
  echo [ERROR] Node.js not found at %NODE_DIR%.
  pause
  exit /b 1
)

set "ROOT=%~dp0"
cd /d %ROOT%

echo.
echo === Urban Threads — Deploy Helper ===
echo.
echo This script will:
echo   1. Initialise git, stage everything except .env files
echo   2. Create the first commit on 'main'
echo.
echo Next steps (manual, requires you to be logged in):
echo   3. Create an empty repo at https://github.com/new
echo   4. Run:  git remote add origin ^<your-repo-url^>
echo            git push -u origin main
echo   5. Go to https://vercel.com/new, import the repo
echo   6. Set Root Directory = client
echo      Set VITE_API_URL = your-backend-url/api (or leave blank for now)
echo   7. Click Deploy
echo.
echo For the backend, follow docs/deployment.md (Render free tier works well).
echo.
pause

echo.
echo [1/3] Initialising git ...
git init
if errorlevel 1 (
  echo [ERROR] git init failed
  exit /b 1
)
git branch -M main

echo.
echo [2/3] Staging files (excluding .env, node_modules, dist) ...
git add .
git status --short

echo.
echo [3/3] Creating initial commit ...
git commit -m "Initial commit: Urban Threads e-commerce app"
if errorlevel 1 (
  echo [ERROR] git commit failed (maybe nothing to commit?)
  exit /b 1
)

echo.
echo ============================================================
echo  Git is ready. Next steps:
echo.
echo    1. Create a new empty repo at https://github.com/new
echo       DO NOT initialise it with README/.gitignore (we already have them)
echo.
echo    2. From this directory, run:
echo.
echo       git remote add origin https://github.com^<YOUR-USERNAME^>/urban-threads.git
echo       git push -u origin main
echo.
echo    3. Go to https://vercel.com/new
echo       - Click "Add New Project"
echo       - Import the repo you just pushed
echo       - Root Directory:  client
echo       - Framework:  Vite (auto-detected)
echo       - Add env var:  VITE_API_URL = https://your-backend.example.com/api
echo       - Click Deploy
echo.
echo    4. About 60 seconds later you'll have a live URL like
echo       https://urban-threads.vercel.app
echo.
echo    Full instructions in docs/deployment.md
echo ============================================================
echo.
pause
endlocal
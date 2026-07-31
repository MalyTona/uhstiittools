@echo off
setlocal
cd /d "%~dp0.."

if not exist "backend\.venv\Scripts\python.exe" (
  python -m venv backend\.venv || exit /b 1
)
"backend\.venv\Scripts\python.exe" -m pip install -r backend\requirements-dev.txt || exit /b 1
pushd frontend
call npm.cmd install || (popd & exit /b 1)
popd

start "UHST-IIT PDF API" /D "%CD%\backend" cmd /k ".venv\Scripts\python.exe run.py"
start "UHST-IIT PDF UI" /D "%CD%\frontend" cmd /k "npm.cmd run dev"

echo Backend and frontend development servers are starting in separate windows.


@echo off
setlocal
cd /d "%~dp0.."

if not exist "backend\.venv\Scripts\python.exe" (
  python -m venv backend\.venv || exit /b 1
)
"backend\.venv\Scripts\python.exe" -m pip install -r backend\requirements-dev.txt || exit /b 1
pushd backend
".venv\Scripts\python.exe" -m pytest || (popd & exit /b 1)
popd

pushd frontend
call npm.cmd install || (popd & exit /b 1)
call npm.cmd test || (popd & exit /b 1)
call npm.cmd run build || (popd & exit /b 1)
popd

echo Production build completed successfully in frontend\dist.


@echo off
title Tempus - servidor local
cd /d "%~dp0"
echo.
echo TEMPUS - previa local
echo Mantenha esta janela aberta enquanto usa o app.
echo Quando aparecer Ready, abra http://127.0.0.1:4173/contratar
echo Para encerrar, pressione Ctrl+C.
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale o Node.js antes de continuar.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo Dependencias ausentes. Execute npm install nesta pasta.
  pause
  exit /b 1
)
node node_modules/next/dist/bin/next dev --turbopack --hostname 127.0.0.1 --port 4173
pause

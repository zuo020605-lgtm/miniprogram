@echo off
chcp 65001 > nul
echo ===================================
echo Starting local Mock server...
echo ===================================
echo.
cd /d "%~dp0local-server"
call npm install
node src/server.js
pause
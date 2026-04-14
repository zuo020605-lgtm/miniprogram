@echo off
chcp 65001 > nul
echo Starting unified Mock server on http://localhost:3000...
cd /d "%~dp0local-server"
node src/server.js
pause

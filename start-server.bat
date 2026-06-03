@echo off
cd /d "%~dp0"
set PORT=3000
"%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
pause

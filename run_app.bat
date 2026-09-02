@echo off
title DictaLearn - AI English Platform
cd /d "%~dp0"
echo ===================================================================
echo   DictaLearn - Nen Tang Luyen Nghe Chep Chinh Ta & Luyen Noi AI
echo ===================================================================
echo.
echo [1] Dang khoi dong Web Server tai http://localhost:5500 ...
echo [2] Trinh duyet se tu dong mo. Hay bam 'Cho phep' (Allow) Microphone!
echo.

start "" "http://localhost:5500/index.html"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"

pause

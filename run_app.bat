@echo off
title DictaLearn - AI English Platform
cd /d "%~dp0"
echo ===================================================================
echo   DictaLearn - Nen Tang Luyen Nghe Chep Chinh Ta & Luyen Noi AI
echo ===================================================================
echo.
echo [1] Dang khoi dong Web Server tai http://localhost:5500 ...
echo [2] Dang cho Web Server san sang...
echo.

rem Start the server first. Opening the browser before the listener was ready
rem could show a connection error on slower machines.
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing 'http://localhost:5500/index.html' -TimeoutSec 1; if($r.StatusCode -eq 200){exit 0} } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 goto server_ready

start "DictaLearn Server" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

:server_ready
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready=$false; for($i=0;$i -lt 20;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing 'http://localhost:5500/index.html' -TimeoutSec 1; if($r.StatusCode -eq 200){$ready=$true;break} } catch {}; Start-Sleep -Milliseconds 250 }; if(-not $ready){exit 1}"
if errorlevel 1 (
  echo [LOI] Khong the khoi dong DictaLearn tai cong 5500.
  echo Hay dong cua so DictaLearn Server cu roi thu lai.
  pause
  exit /b 1
)

echo [3] Da san sang. Dang mo trinh duyet...
start "" "http://localhost:5500/index.html"

exit /b 0

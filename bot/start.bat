@echo off
title Sofia Bot

echo Iniciando Sofia Bot...

:: Mata processos anteriores na porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000 "') do taskkill /F /PID %%a 2>nul

:: Aguarda
timeout /t 2 /nobreak >nul

:: Inicia o bot Node.js em background
start "Sofia Bot" cmd /c "cd /d d:\lpedlira\bot && node server.js"

:: Aguarda bot iniciar
timeout /t 4 /nobreak >nul

echo Bot iniciado. Iniciando tunnel...

:tunnel_loop
:: Inicia o tunnel e captura a URL
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -R 80:localhost:3000 serveo.net 2>&1 | findstr /r "https://.*serveousercontent.com" > d:\lpedlira\bot\tunnel_url.txt

:: Se o tunnel morreu, aguarda 5s e tenta novamente
echo Tunnel caiu. Reiniciando em 5s...
timeout /t 5 /nobreak >nul
goto tunnel_loop

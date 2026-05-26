@echo off
title Follow-up de Prospeccao - Eleva Digital
cd /d "%~dp0"
echo.
echo  ============================================
echo    FOLLOW-UP DE PROSPECCAO - ELEVA DIGITAL
echo  ============================================
echo.
echo  Reenvia para quem recebeu o 1o disparo e ainda
echo  nao respondeu. Rode a cada 2 ou 3 dias.
echo.
set /p QTD=  Quantos follow-ups enviar agora?
echo.
set /p CONF=  Digite SIM e Enter para confirmar o envio:
if /i not "%CONF%"=="SIM" (
  echo.
  echo  Cancelado. Nada foi enviado.
  echo.
  pause
  exit /b
)
echo.
node disparo-followup.js --send --max %QTD%
echo.
echo  ===== Follow-up encerrado. Pode fechar esta janela. =====
pause

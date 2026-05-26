@echo off
title Disparo de Prospeccao - Eleva Digital
cd /d "%~dp0"
echo.
echo  ============================================
echo    DISPARO DE PROSPECCAO - ELEVA DIGITAL
echo  ============================================
echo.
echo  Aquecimento do numero (recomendado):
echo    Dias 1-2: 8     Dias 3-4: 12
echo    Dias 5-7: 18    Semana 2 em diante: 25
echo.
set /p QTD=  Quantos leads disparar agora?
echo.
echo  Vou disparar para %QTD% leads, 1 a cada 1-3 min.
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
node disparo.js --send --max %QTD%
echo.
echo  ===== Disparo encerrado. Pode fechar esta janela. =====
pause

@echo off
REM Переходим в директорию проекта
cd /d "C:\Users\rarepev\Desktop\task-app"

REM Запускаем Express-сервер в фоновом режиме
start "Task App Server" /min cmd /c node api\server.js

REM Ждем 3 секунды, чтобы сервер успел запуститься
timeout /t 3 /nobreak >nul

REM Запускаем Electron-приложение
start "Task App Electron" /min cmd /c npx electron .

REM Закрываем окно командной строки
exit
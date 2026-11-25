@echo off
chcp 65001
cd /d %~dp0backend
start "" http://localhost:8224
call npm run dev
pause

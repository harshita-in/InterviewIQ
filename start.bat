@echo off
title InterviewIQ Launcher
echo ========================================================
echo   InterviewIQ - AI-Based Mock Interview Platform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend Server (FastAPI on Port 8000)...
start "InterviewIQ Backend" cmd /k "cd backend && venv\Scripts\python.exe run.py"

echo [2/2] Starting Frontend App (Vite on Port 5173)...
start "InterviewIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started successfully!
echo Waiting 3 seconds for services to initialize...
timeout /t 3 >nul

echo Opening InterviewSense in your default browser...
start http://localhost:5173

echo.
echo Leave this launcher window or press any key to close launcher (servers will keep running).
pause

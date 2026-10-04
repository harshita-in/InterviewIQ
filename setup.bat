@echo off
title InterviewIQ Setup Script
echo ========================================================
echo   Setting up InterviewIQ Environment
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Setting up Python Virtual Environment...
cd backend
if not exist "venv" (
    python -m venv venv
)
echo Installing Backend Requirements...
venv\Scripts\pip.exe install -r requirements.txt

cd ..

echo [2/3] Setting up Frontend Dependencies...
cd frontend
call npm install

cd ..

echo [3/3] Setup Completed! You can now run start.bat to launch InterviewIQ.
pause

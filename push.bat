@echo off
title Push to GitHub - InterviewIQ
echo ========================================================
echo   Pushing InterviewIQ to GitHub (https://github.com/harshita-in/InterviewIQ)
echo ========================================================
echo.

cd /d "%~dp0"

echo Running: git push -u origin main
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   [SUCCESS] Code pushed successfully to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTE] If authentication failed:
    echo   Please sign in via GitHub browser prompt or Personal Access Token (PAT).
    echo ========================================================
)
echo.
pause

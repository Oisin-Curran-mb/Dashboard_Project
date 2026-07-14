@echo off
cd /d "%~dp0"

echo Checking for changes...
git add -A

set /p msg="Commit message (leave blank for auto): "
if "%msg%"=="" set msg=Update %date% %time%

git commit -m "%msg%"
if errorlevel 1 (
    echo Nothing new to commit.
) else (
    echo Pushing to GitHub...
    git push
)

echo.
echo Done.
pause

@echo off
REM ===========================================
REM Start FoodCal FastAPI backend
REM ===========================================

REM Navigate to the project root (adjust if needed)
cd /d D:\projects\FoodCal

REM Activate the virtual environment
call backend\.venv\Scripts\activate.bat

REM Start Uvicorn
uvicorn backend.api:app --reload

REM Optional: pause so you can see errors after stopping
pause
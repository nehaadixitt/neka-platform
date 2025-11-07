@echo off
echo Installing NEKA Platform Revamp Dependencies...
echo.

echo Installing client dependencies...
cd client
call npm install

echo.
echo Setup complete! 
echo.
echo To start the development servers:
echo 1. Backend: npm run dev (from root directory)
echo 2. Frontend: cd client && npm start
echo.
pause
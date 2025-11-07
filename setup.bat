@echo off
echo Setting up NEKA Platform...

echo.
echo Installing backend dependencies...
call npm install

echo.
echo Setting up client directory...
cd client
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Make sure MongoDB is running
echo 2. Run: npm run dev (for backend)
echo 3. In another terminal, run: cd client && npm start (for frontend)
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
pause
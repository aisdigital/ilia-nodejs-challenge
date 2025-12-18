@echo off
REM Quality Gate Script for Windows
setlocal EnableDelayedExpansion

echo 🔍 Starting Quality Gate Checks...

:check_service
set SERVICE=%1
echo.
echo 📦 Checking %SERVICE%...
cd %SERVICE%

echo 📥 Installing dependencies...
call npm ci --silent
if errorlevel 1 goto error

echo 🔧 Checking TypeScript compilation...
call npm run build
if errorlevel 1 goto error

echo 🧹 Running ESLint...
call npm run lint
if errorlevel 1 goto error

echo ✨ Checking code formatting...
call npm run format:check
if errorlevel 1 goto error

echo 🔒 Running security audit...
call npm audit --audit-level=moderate
if errorlevel 1 goto error

echo 🧪 Running tests with coverage...
call npm run test:coverage
if errorlevel 1 goto error

echo ✅ %SERVICE% passed all quality checks!
cd ..
goto :eof

:error
echo ❌ Quality gate failed for %SERVICE%
exit /b 1

REM Main execution
if not exist "ms-wallet" goto wrong_dir
if not exist "ms-users" goto wrong_dir

call :check_service ms-wallet
if errorlevel 1 exit /b 1

call :check_service ms-users  
if errorlevel 1 exit /b 1

echo.
echo 🐳 Validating Docker Compose...
docker-compose config --quiet
if errorlevel 1 goto docker_error

echo.
echo 🎉 All Quality Gate checks passed!
echo ✅ Code quality: PASSED
echo ✅ Security: PASSED
echo ✅ Test coverage: PASSED
echo ✅ Build: PASSED
echo.
echo 🚀 Ready for deployment!
goto end

:wrong_dir
echo ❌ Please run this script from the project root directory
exit /b 1

:docker_error
echo ❌ Docker Compose validation failed
exit /b 1

:end
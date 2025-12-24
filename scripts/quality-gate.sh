#!/bin/bash

# Quality Gate Script for ília NodeJS Challenge
set -e

echo "🔍 Starting Quality Gate Checks..."

# Function to run quality checks for a service
run_quality_checks() {
    SERVICE=$1
    echo ""
    echo "📦 Checking $SERVICE..."
    cd $SERVICE
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    npm ci --silent
    
    # TypeScript compilation
    echo "🔧 Checking TypeScript compilation..."
    npm run build
    
    # Linting
    echo "🧹 Running ESLint..."
    npm run lint
    
    # Formatting check
    echo "✨ Checking code formatting..."
    npm run format:check
    
    # Security audit
    echo "🔒 Running security audit..."
    npm audit --audit-level=moderate
    
    # Tests with coverage
    echo "🧪 Running tests with coverage..."
    npm run test:coverage
    
    # Coverage threshold check
    echo "📊 Checking coverage thresholds..."
    COVERAGE=$(npm run test:coverage:json --silent | grep -o '"total":{"lines":{"pct":[0-9.]*}' | grep -o '[0-9.]*' || echo "0")
    echo "Coverage: ${COVERAGE}%"
    
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
        echo "❌ Coverage below 80%: ${COVERAGE}%"
        exit 1
    fi
    
    # Check for TODO/FIXME comments
    echo "📝 Checking for excessive TODO/FIXME comments..."
    TODO_COUNT=$(find src -name "*.ts" -exec grep -l "TODO\|FIXME" {} \; 2>/dev/null | wc -l || echo "0")
    if [ $TODO_COUNT -gt 5 ]; then
        echo "❌ Too many TODO/FIXME comments: $TODO_COUNT"
        exit 1
    fi
    
    echo "✅ $SERVICE passed all quality checks!"
    cd ..
}

# Check if we're in the right directory
if [ ! -d "ms-wallet" ] || [ ! -d "ms-users" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Run checks for both services
run_quality_checks "ms-wallet"
run_quality_checks "ms-users"

# Docker compose validation
echo ""
echo "🐳 Validating Docker Compose..."
docker-compose config --quiet

# Overall project checks
echo ""
echo "📋 Running project-wide checks..."

# Check for sensitive data in commits
echo "🔍 Checking for sensitive data..."
if grep -r "password\|secret\|key" --include="*.ts" --include="*.js" --include="*.json" . | grep -v ".git" | grep -v "node_modules" | grep -v "package-lock.json"; then
    echo "⚠️  Potential sensitive data found in code. Please review."
fi

# Check README completeness
echo "📖 Checking documentation..."
if [ ! -f "README.md" ]; then
    echo "❌ Missing README.md"
    exit 1
fi

# Final success message
echo ""
echo "🎉 All Quality Gate checks passed!"
echo "✅ Code quality: PASSED"
echo "✅ Security: PASSED" 
echo "✅ Test coverage: PASSED"
echo "✅ Build: PASSED"
echo ""
echo "🚀 Ready for deployment!"
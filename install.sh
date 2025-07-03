#!/bin/bash

echo "🚀 Installing SolPulse dependencies..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed successfully"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed successfully"
echo ""

# Go back to root directory
cd ..

echo "🎉 All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables (see README.md)"
echo "2. Run './start.sh' to start the application"
echo "" 
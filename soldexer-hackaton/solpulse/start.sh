#!/bin/bash

echo "Starting SolPulse..."

# Function to kill background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT

# Start backend
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "SolPulse is running!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
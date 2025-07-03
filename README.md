# SolPulse 🚀

**Real-time Solana Blockchain Dashboard**

SolPulse is a real-time dashboard that monitors and displays live Solana blockchain activity including DEX swaps, whale transactions, NFT mints, and token launches. Built with React, Node.js, and powered by the Soldexer API for real-time blockchain data.

![SolPulse Dashboard](https://img.shields.io/badge/Status-Live-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

## ✨ Features

### 🔄 **Real-time DEX Swaps**
- Live monitoring of Drift protocol transactions
- Real token pair detection (SOL, USDC, USDT, BONK, WIF, JUP)
- Actual swap amounts and prices from blockchain data
- Volume tracking with USD conversion

### 🐋 **Whale Alerts**
- Detection of large SOL transactions (>100 SOL threshold)
- Real-time balance change monitoring
- Account activity tracking with before/after balances
- USD value calculations

### 🎨 **NFT Mints** *(Coming Soon)*
- Real-time NFT minting activity
- Collection tracking
- Price and rarity analysis

### 🪙 **Token Launches** *(Coming Soon)*
- New token detection
- Initial liquidity tracking
- Launch analytics

### 📊 **Network Health**
- Real-time block processing
- Connection status monitoring
- Performance metrics

## 🛠️ Tech Stack

### **Backend**
- **Node.js** with Express.js
- **Socket.IO** for real-time WebSocket communication
- **Soldexer API** for blockchain data streaming
- **SQLite** for data persistence (with in-memory caching)
- **Winston** for structured logging

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern styling
- **React Query** for data fetching and caching
- **Socket.IO Client** for real-time updates
- **Date-fns** for time formatting

### **Data Sources**
- **Soldexer API**: Real-time Solana blockchain data
- **Drift Protocol**: DEX swap detection
- **Balance Changes**: Whale transaction monitoring

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm**
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solpulse
   ```

2. **Install dependencies**
   ```bash
   ./install.sh
   ```
   
   Or manually:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Environment Setup** *(Optional)*
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Configure environment variables:
   ```env
   SOLDEXER_API_URL=https://portal.sqd.dev/datasets/solana-mainnet
   SOLDEXER_API_KEY=demo
   PORT=3001
   ```

4. **Start the application**
   ```bash
   ./start.sh
   ```

5. **Access the dashboard**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001


## 🔍 How It Works

### **Data Flow**
1. **Soldexer Stream**: Connects to Soldexer API for real-time Solana data
2. **Transaction Processing**: Analyzes instructions and balance changes
3. **Event Detection**: Identifies DEX swaps, whale transactions, etc.
4. **Real-time Broadcasting**: Emits events via WebSocket to frontend
5. **UI Updates**: React components update in real-time

### **DEX Swap Detection**
- Monitors Drift protocol instructions (`dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH`)
- Analyzes instruction data and account changes
- Extracts real token pairs and amounts
- Calculates prices and USD volumes

### **Whale Detection**
- Monitors SOL balance changes >100 SOL
- Tracks account activity and transaction patterns
- Calculates USD values and percentage changes

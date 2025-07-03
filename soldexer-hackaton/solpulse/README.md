# SolPulse - Real-time Solana Activity Dashboard

A comprehensive real-time dashboard that monitors Solana ecosystem activity using Soldexer's high-throughput data access. Built for the Soldexer Hackathon.

## Features

- **Live DEX Activity Feed**: Real-time swap tracking across major Solana DEXs (Orca, Raydium, Meteora, Jupiter)
- **NFT Mint Stream**: Live feed of new NFT mints with metadata
- **Pump.fun Launch Tracker**: Real-time monitoring of new token launches
- **Whale Alert System**: Large transaction notifications with customizable thresholds
- **Network Health Metrics**: Current TPS, average fees, slot height, and congestion indicators

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Socket.io-client for real-time updates
- React Query for data fetching
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js with Express
- Socket.io for WebSocket connections
- SQLite for development (easily upgradeable to PostgreSQL/ClickHouse)
- Winston for logging
- Node-cron for scheduled tasks

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
cd soldexer-hackaton/solpulse
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173

### Environment Variables

Backend (.env):
```env
PORT=3001
NODE_ENV=development
SOLDEXER_API_BASE=https://api.soldexer.dev
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/solpulse.db
```

Frontend (optional - create .env.local):
```env
VITE_BACKEND_URL=http://localhost:3001
```

## Architecture

### Data Flow
1. **Soldexer Integration**: The backend connects to Soldexer's Pipes API to stream real-time blockchain data
2. **Data Processing**: Incoming data is normalized and stored in SQLite for historical queries
3. **WebSocket Broadcasting**: Processed data is broadcast to connected clients via Socket.io
4. **Frontend Updates**: React components subscribe to specific channels and update in real-time

### Mock Data Mode
When Soldexer API is not available, the application automatically switches to mock data mode, generating realistic test data for development and demonstration purposes.

## Key Components

### Backend Modules
- `lib/soldexer.js`: Handles Soldexer API integration and mock data generation
- `lib/database.js`: SQLite database operations and schema management
- `routes/api.js`: REST API endpoints for historical data

### Frontend Components
- `DexSwaps.tsx`: Displays real-time DEX swap activity
- `NftMints.tsx`: Shows NFT minting activity with metadata
- `TokenLaunches.tsx`: Tracks pump.fun token launches
- `WhaleAlerts.tsx`: Monitors and alerts on large transactions
- `NetworkHealth.tsx`: Displays Solana network metrics

## Features Breakdown

### DEX Swaps
- Real-time swap tracking
- Token pair display with amounts
- Volume indicators with color coding
- DEX identification
- Trader address tracking

### NFT Mints
- Collection and token name display
- Mint price in SOL
- Metadata URI links
- Minter address
- Grid layout for visual appeal

### Token Launches
- Token name and symbol
- Initial liquidity amount
- Creator address
- Social media links (Twitter)
- Platform identification

### Whale Alerts
- Customizable value thresholds
- Transaction type identification
- Sound alerts for large transactions
- From/to address display
- Color-coded by transaction size

## Development

### Adding New Features
1. Create new components in `frontend/src/components`
2. Add WebSocket event handlers in components
3. Create corresponding backend endpoints in `routes/api.js`
4. Update database schema if needed in `lib/database.js`

### Connecting to Real Soldexer API
Update the `setupProductionStreams` function in `backend/lib/soldexer.js` to implement actual Soldexer Pipes integration:

```javascript
// Example implementation
const response = await axios.get(`${SOLDEXER_BASE_URL}/pipes/dex-swaps`);
// Process and broadcast data
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend:
```bash
cd frontend
npm run build
```
2. Deploy the `dist` folder to your hosting service

### Backend (Railway/Render)
1. Ensure all environment variables are set
2. Deploy the backend folder
3. Update frontend's backend URL

## Performance Optimizations

- Virtual scrolling for large data sets
- Debounced WebSocket updates
- Efficient SQLite indexing
- React Query caching
- Lazy loading of components

## Future Enhancements

- Advanced filtering and search
- Historical data charts
- Wallet tracking
- Custom alert configurations
- Export functionality
- Mobile app version

## License

MIT License
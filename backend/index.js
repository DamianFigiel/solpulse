import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';
import { initDatabase } from './lib/database.js';
import { initSoldexerStreams } from './lib/soldexer.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

const subscriptionHandlers = {
  'subscribe-dex-swaps': 'dex-swaps',
  'subscribe-nft-mints': 'nft-mints',
  'subscribe-token-launches': 'token-launches',
  'subscribe-whale-alerts': 'whale-alerts',
  'subscribe-network-health': 'network-health',
  'unsubscribe-dex-swaps': 'dex-swaps',
  'unsubscribe-nft-mints': 'nft-mints',
  'unsubscribe-token-launches': 'token-launches',
  'unsubscribe-whale-alerts': 'whale-alerts',
  'unsubscribe-network-health': 'network-health'
};

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.emit('clear-data');
  
  Object.entries(subscriptionHandlers).forEach(([event, room]) => {
    socket.on(event, () => {
      const action = event.startsWith('subscribe') ? 'join' : 'leave';
      socket[action](room);
      logger.info(`Client ${socket.id} ${action}ed ${room}`);
    });
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  socket.on('ping', () => {
    socket.emit('pong');
  });
  
  socket.on('debug', () => {
    socket.emit('debug-info', {
      socketId: socket.id,
      serverTime: new Date().toISOString()
    });
  });
});

async function start() {
  try {
    await initDatabase();
    logger.info('Database initialized');
    
    const apiUrl = process.env.SOLDEXER_API_URL || 'https://portal.sqd.dev/datasets/solana-mainnet';
    const apiKey = process.env.SOLDEXER_API_KEY || 'demo';
    
    initSoldexerStreams(apiUrl, apiKey, io, logger);
    logger.info('Soldexer streams initialized');
    
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { io, logger };

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
});
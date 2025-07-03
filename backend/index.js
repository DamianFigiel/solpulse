import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';
import { initDatabase } from './lib/database.js';
import { setupSoldexerStreams } from './lib/soldexer.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
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
    connections: io.engine.clientsCount 
  });
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe', (channels) => {
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        socket.join(channel);
        logger.info(`Client ${socket.id} subscribed to ${channel}`);
      });
    }
  });
  
  socket.on('unsubscribe', (channels) => {
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        socket.leave(channel);
        logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
      });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

async function start() {
  try {
    await initDatabase();
    logger.info('Database initialized');
    
    await setupSoldexerStreams(io, logger);
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
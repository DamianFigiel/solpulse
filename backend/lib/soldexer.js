import axios from 'axios';
import cron from 'node-cron';
import { 
  insertDexSwap, 
  insertNftMint, 
  insertTokenLaunch, 
  insertWhaleTransaction 
} from './database.js';

const SOLDEXER_BASE_URL = process.env.SOLDEXER_API_BASE || 'https://api.soldexer.dev';

const MOCK_TOKENS = [
  { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'WIF', name: 'dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  { symbol: 'JUP', name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' }
];

const MOCK_DEXES = ['Orca', 'Raydium', 'Meteora', 'Jupiter'];
const MOCK_NFT_COLLECTIONS = ['DeGods', 'SMB', 'Okay Bears', 'Mad Lads', 'Claynosaurz'];

function generateMockSwap() {
  const tokenIn = MOCK_TOKENS[Math.floor(Math.random() * MOCK_TOKENS.length)];
  const tokenOut = MOCK_TOKENS.filter(t => t !== tokenIn)[Math.floor(Math.random() * (MOCK_TOKENS.length - 1))];
  const amountIn = Math.random() * 10000;
  const price = 0.5 + Math.random() * 2;
  const amountOut = amountIn * price;
  const volumeUsd = amountIn * (tokenIn.symbol === 'USDC' ? 1 : Math.random() * 150);
  
  return {
    transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dex: MOCK_DEXES[Math.floor(Math.random() * MOCK_DEXES.length)],
    token_in: tokenIn.symbol,
    token_out: tokenOut.symbol,
    amount_in: amountIn,
    amount_out: amountOut,
    price: price,
    volume_usd: volumeUsd,
    trader: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now()
  };
}

function generateMockNftMint() {
  const collection = MOCK_NFT_COLLECTIONS[Math.floor(Math.random() * MOCK_NFT_COLLECTIONS.length)];
  
  return {
    mint_address: `${Math.random().toString(36).substr(2, 15)}...${Math.random().toString(36).substr(2, 5)}`,
    collection_name: collection,
    token_name: `${collection} #${Math.floor(Math.random() * 10000)}`,
    symbol: collection.toUpperCase().substring(0, 4),
    uri: `https://arweave.net/${Math.random().toString(36).substr(2, 15)}`,
    price: Math.random() * 100,
    minter: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now()
  };
}

function generateMockTokenLaunch() {
  const names = ['Moon', 'Rocket', 'Diamond', 'Gold', 'Silver', 'Mega', 'Ultra', 'Super'];
  const suffixes = ['Coin', 'Token', 'Inu', 'Doge', 'Cat', 'Pepe'];
  
  const name = `${names[Math.floor(Math.random() * names.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  const symbol = name.substring(0, 4).toUpperCase();
  
  return {
    mint_address: `${Math.random().toString(36).substr(2, 15)}...${Math.random().toString(36).substr(2, 5)}`,
    token_name: name,
    symbol: symbol,
    creator: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 5)}`,
    initial_liquidity: Math.random() * 50000,
    platform: 'pump.fun',
    social_links: Math.random() > 0.5 ? { twitter: `@${symbol.toLowerCase()}token` } : null,
    timestamp: Date.now()
  };
}

function generateMockWhaleTransaction() {
  const token = MOCK_TOKENS[Math.floor(Math.random() * MOCK_TOKENS.length)];
  const amount = 10000 + Math.random() * 990000;
  const valueUsd = amount * (token.symbol === 'USDC' ? 1 : Math.random() * 150);
  
  return {
    transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: Math.random() > 0.5 ? 'transfer' : 'swap',
    from_address: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 5)}`,
    to_address: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 5)}`,
    amount: amount,
    token: token.symbol,
    value_usd: valueUsd,
    timestamp: Date.now()
  };
}

export async function setupSoldexerStreams(io, logger) {
  let isProduction = false;
  
  try {
    const response = await axios.get(`${SOLDEXER_BASE_URL}/health`, { timeout: 5000 });
    isProduction = response.status === 200;
    logger.info('Connected to Soldexer API');
  } catch (error) {
    logger.warn('Soldexer API not available, using mock data');
  }

  if (isProduction) {
    setupProductionStreams(io, logger);
  } else {
    setupMockStreams(io, logger);
  }
}

function setupProductionStreams(io, logger) {
  
  const pollInterval = 3000;
  
  setInterval(async () => {
    try {
      logger.info('Polling Soldexer API - would fetch real data here');
    } catch (error) {
      logger.error('Error fetching from Soldexer:', error);
    }
  }, pollInterval);
}

function setupMockStreams(io, logger) {
  cron.schedule('*/2 * * * * *', async () => {
    if (Math.random() > 0.3) {
      const swap = generateMockSwap();
      await insertDexSwap(swap);
      io.to('dex-swaps').emit('swap', swap);
      
      if (swap.volume_usd > 10000) {
        const whaleAlert = {
          ...generateMockWhaleTransaction(),
          type: 'swap',
          value_usd: swap.volume_usd
        };
        await insertWhaleTransaction(whaleAlert);
        io.to('whale-alerts').emit('whale', whaleAlert);
      }
    }
  });
  
  cron.schedule('*/5 * * * * *', async () => {
    if (Math.random() > 0.5) {
      const mint = generateMockNftMint();
      await insertNftMint(mint);
      io.to('nft-mints').emit('mint', mint);
    }
  });
  
  cron.schedule('*/10 * * * * *', async () => {
    if (Math.random() > 0.7) {
      const launch = generateMockTokenLaunch();
      await insertTokenLaunch(launch);
      io.to('token-launches').emit('launch', launch);
    }
  });
  
  cron.schedule('*/8 * * * * *', async () => {
    if (Math.random() > 0.8) {
      const whale = generateMockWhaleTransaction();
      if (whale.value_usd > 50000) {
        await insertWhaleTransaction(whale);
        io.to('whale-alerts').emit('whale', whale);
      }
    }
  });
  
  logger.info('Mock data streams initialized');
}

export async function fetchNetworkHealth() {
  const mockTPS = 2000 + Math.random() * 2000;
  const mockFee = 0.00025 + Math.random() * 0.0001;
  const mockSlot = Math.floor(Date.now() / 400);
  
  return {
    tps: Math.floor(mockTPS),
    avgFee: mockFee,
    slot: mockSlot,
    congestion: mockTPS > 3000 ? 'high' : mockTPS > 2500 ? 'medium' : 'low',
    timestamp: Date.now()
  };
}
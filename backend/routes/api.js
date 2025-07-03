import express from 'express';
import { 
  getRecentDexSwaps, 
  getRecentNftMints, 
  getRecentTokenLaunches, 
  getRecentWhaleTransactions,
  getNetworkStats
} from '../lib/database.js';
import { fetchNetworkHealth } from '../lib/soldexer.js';

const router = express.Router();

const endpoints = {
  'dex-swaps': { fn: getRecentDexSwaps, error: 'Failed to fetch DEX swaps' },
  'nft-mints': { fn: getRecentNftMints, error: 'Failed to fetch NFT mints' },
  'token-launches': { fn: getRecentTokenLaunches, error: 'Failed to fetch token launches' },
  'whale-transactions': { fn: getRecentWhaleTransactions, error: 'Failed to fetch whale transactions' }
};

Object.entries(endpoints).forEach(([path, { fn, error }]) => {
  router.get(`/${path}`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const data = await fn(limit);
      res.json({ data, count: data.length });
    } catch (err) {
      res.status(500).json({ error });
    }
  });
});

router.get('/network-stats', async (req, res) => {
  try {
    const [dbStats, health] = await Promise.all([
      getNetworkStats(),
      fetchNetworkHealth()
    ]);
    res.json({ ...dbStats, network: health });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network stats' });
  }
});

router.get('/network-health', async (req, res) => {
  try {
    const health = await fetchNetworkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network health' });
  }
});

export default router;
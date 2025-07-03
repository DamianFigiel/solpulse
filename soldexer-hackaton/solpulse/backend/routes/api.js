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

router.get('/dex-swaps', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const swaps = await getRecentDexSwaps(limit);
    res.json({ data: swaps, count: swaps.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DEX swaps' });
  }
});

router.get('/nft-mints', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const mints = await getRecentNftMints(limit);
    res.json({ data: mints, count: mints.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NFT mints' });
  }
});

router.get('/token-launches', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const launches = await getRecentTokenLaunches(limit);
    res.json({ data: launches, count: launches.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token launches' });
  }
});

router.get('/whale-transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await getRecentWhaleTransactions(limit);
    res.json({ data: transactions, count: transactions.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch whale transactions' });
  }
});

router.get('/network-stats', async (req, res) => {
  try {
    const dbStats = await getNetworkStats();
    const health = await fetchNetworkHealth();
    res.json({ 
      ...dbStats,
      network: health
    });
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
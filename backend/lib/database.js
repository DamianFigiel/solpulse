import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', process.env.DATABASE_PATH || './data/solpulse.db');
const db = new sqlite3.Database(dbPath);

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

export async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS dex_swaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE,
      dex TEXT NOT NULL,
      token_in TEXT NOT NULL,
      token_out TEXT NOT NULL,
      amount_in REAL NOT NULL,
      amount_out REAL NOT NULL,
      price REAL NOT NULL,
      volume_usd REAL,
      trader TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS nft_mints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mint_address TEXT UNIQUE,
      collection_name TEXT,
      token_name TEXT,
      symbol TEXT,
      uri TEXT,
      price REAL,
      minter TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS token_launches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mint_address TEXT UNIQUE,
      token_name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      creator TEXT NOT NULL,
      initial_liquidity REAL,
      platform TEXT DEFAULT 'pump.fun',
      social_links TEXT,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS whale_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE,
      type TEXT NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount REAL NOT NULL,
      token TEXT,
      value_usd REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`CREATE INDEX IF NOT EXISTS idx_dex_swaps_timestamp ON dex_swaps(timestamp DESC)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_nft_mints_timestamp ON nft_mints(timestamp DESC)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_token_launches_timestamp ON token_launches(timestamp DESC)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_whale_transactions_value ON whale_transactions(value_usd DESC)`);
}

export async function insertDexSwap(swap) {
  try {
    await run(`
      INSERT OR IGNORE INTO dex_swaps 
      (transaction_id, dex, token_in, token_out, amount_in, amount_out, price, volume_usd, trader, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      swap.transaction_id,
      swap.dex,
      swap.token_in,
      swap.token_out,
      swap.amount_in,
      swap.amount_out,
      swap.price,
      swap.volume_usd,
      swap.trader,
      swap.timestamp
    ]);
  } catch (error) {
    console.error('Error inserting DEX swap:', error);
  }
}

export async function insertNftMint(mint) {
  try {
    await run(`
      INSERT OR IGNORE INTO nft_mints 
      (mint_address, collection_name, token_name, symbol, uri, price, minter, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mint.mint_address,
      mint.collection_name,
      mint.token_name,
      mint.symbol,
      mint.uri,
      mint.price,
      mint.minter,
      mint.timestamp
    ]);
  } catch (error) {
    console.error('Error inserting NFT mint:', error);
  }
}

export async function insertTokenLaunch(launch) {
  try {
    await run(`
      INSERT OR IGNORE INTO token_launches 
      (mint_address, token_name, symbol, creator, initial_liquidity, platform, social_links, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      launch.mint_address,
      launch.token_name,
      launch.symbol,
      launch.creator,
      launch.initial_liquidity,
      launch.platform,
      JSON.stringify(launch.social_links),
      launch.timestamp
    ]);
  } catch (error) {
    console.error('Error inserting token launch:', error);
  }
}

export async function insertWhaleTransaction(transaction) {
  try {
    await run(`
      INSERT OR IGNORE INTO whale_transactions 
      (transaction_id, type, from_address, to_address, amount, token, value_usd, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transaction.transaction_id,
      transaction.type,
      transaction.from_address,
      transaction.to_address,
      transaction.amount,
      transaction.token,
      transaction.value_usd,
      transaction.timestamp
    ]);
  } catch (error) {
    console.error('Error inserting whale transaction:', error);
  }
}

export async function getRecentDexSwaps(limit = 50) {
  return await all(`
    SELECT * FROM dex_swaps 
    ORDER BY timestamp DESC 
    LIMIT ?
  `, [limit]);
}

export async function getRecentNftMints(limit = 50) {
  return await all(`
    SELECT * FROM nft_mints 
    ORDER BY timestamp DESC 
    LIMIT ?
  `, [limit]);
}

export async function getRecentTokenLaunches(limit = 50) {
  return await all(`
    SELECT * FROM token_launches 
    ORDER BY timestamp DESC 
    LIMIT ?
  `, [limit]);
}

export async function getRecentWhaleTransactions(limit = 50) {
  return await all(`
    SELECT * FROM whale_transactions 
    ORDER BY value_usd DESC 
    LIMIT ?
  `, [limit]);
}

export async function getNetworkStats() {
  const swapStats = await get(`
    SELECT 
      COUNT(*) as total_swaps,
      SUM(volume_usd) as total_volume,
      AVG(volume_usd) as avg_volume
    FROM dex_swaps
    WHERE timestamp > ?
  `, [Date.now() - 24 * 60 * 60 * 1000]);

  const mintStats = await get(`
    SELECT COUNT(*) as total_mints
    FROM nft_mints
    WHERE timestamp > ?
  `, [Date.now() - 24 * 60 * 60 * 1000]);

  const launchStats = await get(`
    SELECT COUNT(*) as total_launches
    FROM token_launches
    WHERE timestamp > ?
  `, [Date.now() - 24 * 60 * 60 * 1000]);

  return {
    swaps: swapStats,
    mints: mintStats,
    launches: launchStats
  };
}

export { db };
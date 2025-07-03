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

const tableSchemas = {
  dex_swaps: `
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
  `,
  nft_mints: `
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
  `,
  token_launches: `
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
  `,
  whale_transactions: `
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
  `
};

const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_dex_swaps_timestamp ON dex_swaps(timestamp DESC)',
  'CREATE INDEX IF NOT EXISTS idx_nft_mints_timestamp ON nft_mints(timestamp DESC)',
  'CREATE INDEX IF NOT EXISTS idx_token_launches_timestamp ON token_launches(timestamp DESC)',
  'CREATE INDEX IF NOT EXISTS idx_whale_transactions_value ON whale_transactions(value_usd DESC)'
];

export async function initDatabase() {
  for (const schema of Object.values(tableSchemas)) {
    await run(schema);
  }
  
  for (const index of indexes) {
    await run(index);
  }
}

const insertQueries = {
  dex_swaps: `
    INSERT OR IGNORE INTO dex_swaps 
    (transaction_id, dex, token_in, token_out, amount_in, amount_out, price, volume_usd, trader, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  nft_mints: `
    INSERT OR IGNORE INTO nft_mints 
    (mint_address, collection_name, token_name, symbol, uri, price, minter, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  token_launches: `
    INSERT OR IGNORE INTO token_launches 
    (mint_address, token_name, symbol, creator, initial_liquidity, platform, social_links, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  whale_transactions: `
    INSERT OR IGNORE INTO whale_transactions 
    (transaction_id, type, from_address, to_address, amount, token, value_usd, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
};

async function insertRecord(table, data, params) {
  try {
    await run(insertQueries[table], params);
  } catch (error) {
    console.error(`Error inserting ${table}:`, error);
  }
}

export async function insertDexSwap(swap) {
  await insertRecord('dex_swaps', swap, [
    swap.transaction_id, swap.dex, swap.token_in, swap.token_out,
    swap.amount_in, swap.amount_out, swap.price, swap.volume_usd,
    swap.trader, swap.timestamp
  ]);
}

export async function insertNftMint(mint) {
  await insertRecord('nft_mints', mint, [
    mint.mint_address, mint.collection_name, mint.token_name,
    mint.symbol, mint.uri, mint.price, mint.minter, mint.timestamp
  ]);
}

export async function insertTokenLaunch(launch) {
  await insertRecord('token_launches', launch, [
    launch.mint_address, launch.token_name, launch.symbol,
    launch.creator, launch.initial_liquidity, launch.platform,
    JSON.stringify(launch.social_links), launch.timestamp
  ]);
}

export async function insertWhaleTransaction(transaction) {
  await insertRecord('whale_transactions', transaction, [
    transaction.transaction_id, transaction.type, transaction.from_address,
    transaction.to_address, transaction.amount, transaction.token,
    transaction.value_usd, transaction.timestamp
  ]);
}

const selectQueries = {
  dex_swaps: 'SELECT * FROM dex_swaps ORDER BY timestamp DESC LIMIT ?',
  nft_mints: 'SELECT * FROM nft_mints ORDER BY timestamp DESC LIMIT ?',
  token_launches: 'SELECT * FROM token_launches ORDER BY timestamp DESC LIMIT ?',
  whale_transactions: 'SELECT * FROM whale_transactions ORDER BY value_usd DESC LIMIT ?'
};

export async function getRecentDexSwaps(limit = 50) {
  return await all(selectQueries.dex_swaps, [limit]);
}

export async function getRecentNftMints(limit = 50) {
  return await all(selectQueries.nft_mints, [limit]);
}

export async function getRecentTokenLaunches(limit = 50) {
  return await all(selectQueries.token_launches, [limit]);
}

export async function getRecentWhaleTransactions(limit = 50) {
  return await all(selectQueries.whale_transactions, [limit]);
}

export async function getNetworkStats() {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  const [swapStats, mintStats, launchStats] = await Promise.all([
    get(`
      SELECT 
        COUNT(*) as total_swaps,
        SUM(volume_usd) as total_volume,
        AVG(volume_usd) as avg_volume
      FROM dex_swaps
      WHERE timestamp > ?
    `, [dayAgo]),
    get('SELECT COUNT(*) as total_mints FROM nft_mints WHERE timestamp > ?', [dayAgo]),
    get('SELECT COUNT(*) as total_launches FROM token_launches WHERE timestamp > ?', [dayAgo])
  ]);

  return {
    swaps: swapStats,
    mints: mintStats,
    launches: launchStats
  };
}

export { db };
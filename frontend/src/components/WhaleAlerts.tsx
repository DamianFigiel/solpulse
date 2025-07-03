import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { Zap, DollarSign, ArrowRight, ExternalLink } from 'lucide-react';

interface WhaleTransaction {
  id: string;
  transaction_id: string;
  blockNumber: number;
  transactionIndex: number;
  account: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string | number;
  amountUsd: string | number;
  preBalance: string;
  postBalance: string;
  change: 'increase' | 'decrease';
  timestamp: number;
}

const formatAmount = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0';
  if (numAmount >= 1000000) return `${(numAmount / 1000000).toFixed(2)}M`;
  if (numAmount >= 1000) return `${(numAmount / 1000).toFixed(2)}K`;
  return numAmount.toFixed(2);
};

const formatUSD = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0';
  return `$${numAmount.toLocaleString()}`;
};

export function WhaleAlerts() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { connected, subscribe, unsubscribe, on, off } = useWebSocket();

  const handleNewTransaction = useCallback((transaction: WhaleTransaction) => {
    setTransactions(prev => [transaction, ...prev].slice(0, 100));
    setLastUpdate(new Date());
  }, []);

  const handleClearData = useCallback(() => {
    setTransactions([]);
  }, []);

  useEffect(() => {
    subscribe(['whale-alerts']);
    on('whale', handleNewTransaction);
    on('clear-data', handleClearData);
    
    return () => {
      off('whale', handleNewTransaction);
      off('clear-data', handleClearData);
      unsubscribe(['whale-alerts']);
    };
  }, [subscribe, unsubscribe, on, off, handleNewTransaction, handleClearData]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-500/20 border border-blue-400/30">
            <DollarSign className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">Whale Alerts</h2>
            <p className="text-base text-gray-400">Large value transactions</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-3 mb-1">
            <Zap className={`w-5 h-5 ${connected ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
            <span className={`text-base font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
            <p className="text-gray-500 text-xl">Waiting for real-time whale transactions...</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={`${tx.transaction_id}-${tx.timestamp}-${tx.id || 'unknown'}`}
              className="data-row flex items-center justify-between py-6"
            >
              <div className="flex items-center space-x-8">
                <div className="whale-badge">
                  {tx.token}
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right min-w-[120px]">
                    <div className="text-sm text-gray-400 font-medium">Account</div>
                    <div className="font-bold text-gray-100">{tx.fromAddress}</div>
                    <div className="text-xs text-gray-500">
                      {tx.change === 'increase' ? '+' : '-'}{formatAmount(tx.amount)} {tx.token}
                    </div>
                  </div>
                  
                  <ArrowRight className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  
                  <div className="text-left min-w-[120px]">
                    <div className="text-sm text-gray-400 font-medium">Balance Change</div>
                    <div className="font-bold text-gray-100">{formatAmount(tx.postBalance)} {tx.token}</div>
                    <div className="text-xs text-gray-500">
                      from {formatAmount(tx.preBalance)} {tx.token}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="volume-badge volume-high">
                  {formatUSD(tx.amountUsd)}
                </div>
                
                <div className="text-right min-w-[140px]">
                  <div className="text-base font-semibold text-gray-200 mb-1">
                    {format(new Date(tx.timestamp), 'HH:mm:ss')}
                  </div>
                  <div className="text-sm text-gray-500 font-mono flex items-center space-x-1">
                    <span>Block {tx.blockNumber}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
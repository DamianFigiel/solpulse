import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface DexSwap {
  id: number;
  transaction_id: string;
  dex: string;
  token_in: string;
  token_out: string;
  amount_in: number | string;
  amount_out: number | string;
  price: number | string;
  volume_usd: number | string;
  trader: string;
  timestamp: number;
}

const formatters = {
  volume: (volume: number | string) => {
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (isNaN(numVolume)) return '$0';
    if (numVolume >= 1000000) return `$${(numVolume / 1000000).toFixed(2)}M`;
    if (numVolume >= 1000) return `$${(numVolume / 1000).toFixed(2)}K`;
    return `$${numVolume.toFixed(2)}`;
  },
  
  amount: (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    if (numAmount >= 1000000) return `${(numAmount / 1000000).toFixed(2)}M`;
    if (numAmount >= 1000) return `${(numAmount / 1000).toFixed(2)}K`;
    return numAmount.toFixed(2);
  }
};

const getVolumeClass = (volume: number | string) => {
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (isNaN(numVolume)) return 'volume-minimal';
  if (numVolume >= 100000) return 'volume-high';
  if (numVolume >= 50000) return 'volume-medium';
  if (numVolume >= 10000) return 'volume-low';
  return 'volume-minimal';
};

const getDexClass = (dex: string) => {
  const classes = {
    orca: 'dex-orca',
    raydium: 'dex-raydium',
    jupiter: 'dex-jupiter',
    meteora: 'dex-meteora'
  };
  return classes[dex.toLowerCase() as keyof typeof classes] || 'dex-orca';
};

export function DexSwaps() {
  const [swaps, setSwaps] = useState<DexSwap[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hasRealTimeData, setHasRealTimeData] = useState(false);
  const { connected, subscribe, unsubscribe, on, off, reconnect } = useWebSocket();

  const { data: initialSwaps, isLoading } = useQuery({
    queryKey: ['dex-swaps'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/dex-swaps`);
      return response.data.data as DexSwap[];
    },
    enabled: !hasRealTimeData,
  });

  useEffect(() => {
    if (initialSwaps && !hasRealTimeData) {
      setSwaps(initialSwaps);
    }
  }, [initialSwaps, hasRealTimeData]);

  const handleNewSwap = useCallback((swap: DexSwap) => {
    setSwaps((prev) => {
      if (!hasRealTimeData) {
        setHasRealTimeData(true);
        return [swap];
      }
      
      const exists = prev.some(existingSwap => 
        existingSwap.transaction_id === swap.transaction_id && 
        existingSwap.id === swap.id
      );
      
      if (exists) return prev;
      
      return [swap, ...prev].slice(0, 100);
    });
    setLastUpdate(new Date());
  }, [hasRealTimeData]);

  const handleClearData = useCallback(() => {
    setSwaps([]);
  }, []);

  useEffect(() => {
    subscribe(['dex-swaps']);
    on('swap', handleNewSwap);
    on('clear-data', handleClearData);
    
    return () => {
      off('swap', handleNewSwap);
      off('clear-data', handleClearData);
      unsubscribe(['dex-swaps']);
    };
  }, [subscribe, unsubscribe, on, off, handleNewSwap, handleClearData]);

  useEffect(() => {
    if (!connected) {
      const timer = setTimeout(() => {
        reconnect();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, reconnect]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-dark-200/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-400/20 to-accent-500/20 border border-primary-400/30">
              <TrendingUp className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-2">Live DEX Swaps</h2>
              <p className="text-base text-gray-400">Real-time trading activity across Solana DEXs</p>
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
            <div className="text-xs text-gray-500">
              Real-time: {hasRealTimeData ? 'Yes' : 'No'} | Count: {swaps.length}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {swaps.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
              <p className="text-gray-500 text-xl">Waiting for real-time swaps...</p>
            </div>
          ) : (
            swaps.map((swap, index) => (
              <div
                key={`${swap.transaction_id}-${swap.id}-${index}-${swap.timestamp}`}
                className="data-row flex items-center justify-between py-6"
              >
                <div className="flex items-center space-x-8">
                  <div className={`dex-badge ${getDexClass(swap.dex)}`}>
                    {swap.dex}
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-lg text-gray-100">{formatters.amount(swap.amount_in)}</div>
                      <div className="text-sm text-gray-400 font-medium">{swap.token_in}</div>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    
                    <div className="text-left min-w-[100px]">
                      <div className="font-bold text-lg text-gray-100">{formatters.amount(swap.amount_out)}</div>
                      <div className="text-sm text-gray-400 font-medium">{swap.token_out}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className={`volume-badge ${getVolumeClass(swap.volume_usd)}`}>
                    {formatters.volume(swap.volume_usd)}
                  </div>
                  
                  <div className="text-right min-w-[140px]">
                    <div className="text-base font-semibold text-gray-200 mb-1">
                      {format(new Date(swap.timestamp), 'HH:mm:ss')}
                    </div>
                    <div className="text-sm text-gray-500 font-mono flex items-center space-x-1">
                      <span>{swap.trader}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
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
  amount_in: number;
  amount_out: number;
  price: number;
  volume_usd: number;
  trader: string;
  timestamp: number;
}

export function DexSwaps() {
  const [swaps, setSwaps] = useState<DexSwap[]>([]);
  const { subscribe, unsubscribe, on, off } = useWebSocket();

  const { data: initialSwaps, isLoading } = useQuery({
    queryKey: ['dex-swaps'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/dex-swaps`);
      return response.data.data as DexSwap[];
    },
  });

  useEffect(() => {
    if (initialSwaps) {
      setSwaps(initialSwaps);
    }
  }, [initialSwaps]);

  useEffect(() => {
    subscribe(['dex-swaps']);

    const handleNewSwap = (swap: DexSwap) => {
      setSwaps((prev) => [swap, ...prev].slice(0, 100));
    };

    on('swap', handleNewSwap);

    return () => {
      off('swap', handleNewSwap);
      unsubscribe(['dex-swaps']);
    };
  }, [subscribe, unsubscribe, on, off]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const getVolumeColor = (volume: number) => {
    if (volume >= 100000) return 'text-purple-400';
    if (volume >= 50000) return 'text-green-400';
    if (volume >= 10000) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-dark-200/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <span>Live DEX Swaps</span>
        </h2>

        <div className="space-y-2">
          {swaps.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Waiting for swaps...</p>
          ) : (
            swaps.map((swap) => (
              <div
                key={swap.transaction_id}
                className="glass-hover rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600/20 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-primary-400">{swap.dex}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{swap.amount_in.toFixed(2)}</span>
                    <span className="text-gray-400">{swap.token_in}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{swap.amount_out.toFixed(2)}</span>
                    <span className="text-gray-400">{swap.token_out}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`font-bold ${getVolumeColor(swap.volume_usd)}`}>
                    {formatVolume(swap.volume_usd)}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {format(new Date(swap.timestamp), 'HH:mm:ss')}
                    </div>
                    <div className="text-xs text-gray-500">{swap.trader}</div>
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
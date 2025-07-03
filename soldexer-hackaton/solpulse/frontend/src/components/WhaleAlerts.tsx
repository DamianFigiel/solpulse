import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface WhaleTransaction {
  id: number;
  transaction_id: string;
  type: string;
  from_address: string;
  to_address: string;
  amount: number;
  token: string;
  value_usd: number;
  timestamp: number;
}

export function WhaleAlerts() {
  const [whales, setWhales] = useState<WhaleTransaction[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { subscribe, unsubscribe, on, off } = useWebSocket();

  const { data: initialWhales, isLoading } = useQuery({
    queryKey: ['whale-transactions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/whale-transactions`);
      return response.data.data as WhaleTransaction[];
    },
  });

  useEffect(() => {
    if (initialWhales) {
      setWhales(initialWhales);
    }
  }, [initialWhales]);

  useEffect(() => {
    subscribe(['whale-alerts']);

    const handleNewWhale = (whale: WhaleTransaction) => {
      setWhales((prev) => [whale, ...prev].slice(0, 50));
      
      if (audioEnabled && whale.value_usd > 100000) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(() => {});
      }
    };

    on('whale', handleNewWhale);

    return () => {
      off('whale', handleNewWhale);
      unsubscribe(['whale-alerts']);
    };
  }, [subscribe, unsubscribe, on, off, audioEnabled]);

  const getAlertColor = (value: number) => {
    if (value >= 1000000) return 'text-red-400 bg-red-400/10';
    if (value >= 500000) return 'text-purple-400 bg-purple-400/10';
    if (value >= 100000) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-green-400 bg-green-400/10';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-dark-200/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span>Whale Alerts</span>
          </h2>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              audioEnabled
                ? 'bg-primary-600 text-white'
                : 'bg-dark-200 text-gray-400'
            }`}
          >
            {audioEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>

        {whales.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Waiting for whale transactions...</p>
        ) : (
          <div className="space-y-3">
            {whales.map((whale) => (
              <div
                key={whale.transaction_id}
                className={`rounded-lg p-4 border ${getAlertColor(whale.value_usd)} border-current/20`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${getAlertColor(whale.value_usd)}`}>
                      {whale.type === 'transfer' ? (
                        <ArrowUpRight className="w-6 h-6" />
                      ) : (
                        <TrendingUp className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-2xl">
                          {formatValue(whale.value_usd)}
                        </span>
                        <span className="text-gray-400">
                          ({whale.amount.toLocaleString()} {whale.token})
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mt-1">
                        <span className="font-mono">{whale.from_address}</span>
                        <span className="mx-2">→</span>
                        <span className="font-mono">{whale.to_address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{whale.type}</p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(whale.timestamp), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
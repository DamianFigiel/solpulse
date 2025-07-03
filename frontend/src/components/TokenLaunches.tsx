import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { Zap, Rocket, ExternalLink } from 'lucide-react';

interface TokenLaunch {
  transaction_id: string;
  token_name: string;
  token_symbol: string;
  initial_liquidity: number;
  initial_liquidity_usd: number;
  creator: string;
  timestamp: number;
}

export function TokenLaunches() {
  const [launches, setLaunches] = useState<TokenLaunch[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { connected, subscribe, unsubscribe, on, off } = useWebSocket();

  // Handle new launch events
  const handleNewLaunch = useCallback((launch: TokenLaunch) => {
    console.log('Received new token launch:', launch);
    setLaunches(prev => [launch, ...prev].slice(0, 100));
    setLastUpdate(new Date());
  }, []);

  // Handle clear data event
  const handleClearData = useCallback(() => {
    console.log('Clearing all existing token launch data');
    setLaunches([]);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    console.log('Setting up token launches WebSocket subscription');
    
    // Subscribe to the token-launches channel
    subscribe(['token-launches']);
    
    // Add event listeners
    on('launch', handleNewLaunch);
    on('clear-data', handleClearData);
    
    // Cleanup function
    return () => {
      off('launch', handleNewLaunch);
      off('clear-data', handleClearData);
      unsubscribe(['token-launches']);
    };
  }, [subscribe, unsubscribe, on, off, handleNewLaunch, handleClearData]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent-400/20 to-yellow-500/20 border border-accent-400/30">
            <Rocket className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">Token Launches</h2>
            <p className="text-base text-gray-400">New token launches</p>
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
        {launches.length === 0 ? (
          <div className="text-center py-16">
            <Rocket className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
            <p className="text-gray-500 text-xl">Waiting for real-time token launches...</p>
          </div>
        ) : (
          launches.map((launch) => (
            <div
              key={launch.transaction_id}
              className="data-row flex items-center justify-between py-6"
            >
              <div className="flex items-center space-x-8">
                <div className="token-badge">
                  {launch.token_symbol}
                </div>
                
                <div>
                  <div className="font-bold text-lg text-gray-100">{launch.token_name}</div>
                  <div className="text-sm text-gray-400 font-medium">
                    Created by {launch.creator}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="liquidity-badge">
                  {launch.initial_liquidity.toFixed(2)} SOL (${launch.initial_liquidity_usd.toFixed(2)})
                </div>
                
                <div className="text-right min-w-[140px]">
                  <div className="text-base font-semibold text-gray-200 mb-1">
                    {format(new Date(launch.timestamp), 'HH:mm:ss')}
                  </div>
                  <div className="text-sm text-gray-500 font-mono flex items-center space-x-1">
                    <span>{launch.transaction_id.slice(0, 6)}...{launch.transaction_id.slice(-4)}</span>
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
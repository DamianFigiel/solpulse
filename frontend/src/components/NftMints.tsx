import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { Zap, Frame, ExternalLink } from 'lucide-react';

interface NftMint {
  transaction_id: string;
  collection: string;
  name: string;
  price: number;
  price_usd: number;
  minter: string;
  timestamp: number;
}

export function NftMints() {
  const [mints, setMints] = useState<NftMint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { connected, subscribe, unsubscribe, on, off } = useWebSocket();

  // Handle new mint events
  const handleNewMint = useCallback((mint: NftMint) => {
    console.log('Received new NFT mint:', mint);
    setMints(prev => [mint, ...prev].slice(0, 100));
    setLastUpdate(new Date());
  }, []);

  // Handle clear data event
  const handleClearData = useCallback(() => {
    console.log('Clearing all existing NFT mint data');
    setMints([]);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    console.log('Setting up NFT mints WebSocket subscription');
    
    // Subscribe to the nft-mints channel
    subscribe(['nft-mints']);
    
    // Add event listeners
    on('mint', handleNewMint);
    on('clear-data', handleClearData);
    
    // Cleanup function
    return () => {
      off('mint', handleNewMint);
      off('clear-data', handleClearData);
      unsubscribe(['nft-mints']);
    };
  }, [subscribe, unsubscribe, on, off, handleNewMint, handleClearData]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-500/20 border border-purple-400/30">
            <Frame className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">NFT Mints</h2>
            <p className="text-base text-gray-400">Latest NFT collection launches</p>
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
        {mints.length === 0 ? (
          <div className="text-center py-16">
            <Frame className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
            <p className="text-gray-500 text-xl">Waiting for real-time NFT mints...</p>
          </div>
        ) : (
          mints.map((mint) => (
            <div
              key={mint.transaction_id}
              className="data-row flex items-center justify-between py-6"
            >
              <div className="flex items-center space-x-8">
                <div className="nft-badge">
                  {mint.collection}
                </div>
                
                <div>
                  <div className="font-bold text-lg text-gray-100">{mint.name}</div>
                  <div className="text-sm text-gray-400 font-medium">
                    Minted by {mint.minter}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="price-badge">
                  {mint.price.toFixed(2)} SOL (${mint.price_usd.toFixed(2)})
                </div>
                
                <div className="text-right min-w-[140px]">
                  <div className="text-base font-semibold text-gray-200 mb-1">
                    {format(new Date(mint.timestamp), 'HH:mm:ss')}
                  </div>
                  <div className="text-sm text-gray-500 font-mono flex items-center space-x-1">
                    <span>{mint.transaction_id.slice(0, 6)}...{mint.transaction_id.slice(-4)}</span>
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
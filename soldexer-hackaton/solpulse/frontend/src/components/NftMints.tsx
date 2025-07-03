import { useEffect, useState } from 'react';
import { Image, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface NftMint {
  id: number;
  mint_address: string;
  collection_name: string;
  token_name: string;
  symbol: string;
  uri: string;
  price: number;
  minter: string;
  timestamp: number;
}

export function NftMints() {
  const [mints, setMints] = useState<NftMint[]>([]);
  const { subscribe, unsubscribe, on, off } = useWebSocket();

  const { data: initialMints, isLoading } = useQuery({
    queryKey: ['nft-mints'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/nft-mints`);
      return response.data.data as NftMint[];
    },
  });

  useEffect(() => {
    if (initialMints) {
      setMints(initialMints);
    }
  }, [initialMints]);

  useEffect(() => {
    subscribe(['nft-mints']);

    const handleNewMint = (mint: NftMint) => {
      setMints((prev) => [mint, ...prev].slice(0, 50));
    };

    on('mint', handleNewMint);

    return () => {
      off('mint', handleNewMint);
      unsubscribe(['nft-mints']);
    };
  }, [subscribe, unsubscribe, on, off]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-dark-200/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Image className="w-6 h-6 text-accent-500" />
          <span>Recent NFT Mints</span>
        </h2>

        {mints.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Waiting for NFT mints...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mints.map((mint) => (
              <div
                key={mint.mint_address}
                className="glass-hover rounded-lg p-4 space-y-3"
              >
                <div className="aspect-square bg-dark-200/50 rounded-lg flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">{mint.token_name}</h3>
                  <p className="text-sm text-gray-400">{mint.collection_name}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-medium text-accent-400">{mint.price.toFixed(2)} SOL</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {format(new Date(mint.timestamp), 'HH:mm:ss')}
                    </p>
                    <p className="text-xs text-gray-600">{mint.minter}</p>
                  </div>
                </div>
                
                <a
                  href={mint.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1 text-xs text-primary-400 hover:text-primary-300"
                >
                  <span>View Metadata</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
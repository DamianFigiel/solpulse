import { useEffect, useState } from 'react';
import { Rocket, Twitter, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface TokenLaunch {
  id: number;
  mint_address: string;
  token_name: string;
  symbol: string;
  creator: string;
  initial_liquidity: number;
  platform: string;
  social_links: any;
  timestamp: number;
}

export function TokenLaunches() {
  const [launches, setLaunches] = useState<TokenLaunch[]>([]);
  const { subscribe, unsubscribe, on, off } = useWebSocket();

  const { data: initialLaunches, isLoading } = useQuery({
    queryKey: ['token-launches'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/token-launches`);
      return response.data.data as TokenLaunch[];
    },
  });

  useEffect(() => {
    if (initialLaunches) {
      setLaunches(initialLaunches);
    }
  }, [initialLaunches]);

  useEffect(() => {
    subscribe(['token-launches']);

    const handleNewLaunch = (launch: TokenLaunch) => {
      setLaunches((prev) => [launch, ...prev].slice(0, 50));
    };

    on('launch', handleNewLaunch);

    return () => {
      off('launch', handleNewLaunch);
      unsubscribe(['token-launches']);
    };
  }, [subscribe, unsubscribe, on, off]);

  const parseSocialLinks = (links: any) => {
    if (typeof links === 'string') {
      try {
        return JSON.parse(links);
      } catch {
        return null;
      }
    }
    return links;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-dark-200/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Rocket className="w-6 h-6 text-purple-500" />
          <span>Token Launches (pump.fun)</span>
        </h2>

        {launches.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Waiting for token launches...</p>
        ) : (
          <div className="space-y-3">
            {launches.map((launch) => {
              const socialLinks = parseSocialLinks(launch.social_links);
              
              return (
                <div
                  key={launch.mint_address}
                  className="glass-hover rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-600/20 p-3 rounded-full">
                      <Rocket className="w-6 h-6 text-purple-400" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white flex items-center space-x-2">
                        <span>{launch.token_name}</span>
                        <span className="text-sm text-gray-400">({launch.symbol})</span>
                      </h3>
                      <p className="text-sm text-gray-400">by {launch.creator}</p>
                      
                      {socialLinks?.twitter && (
                        <a
                          href={`https://twitter.com/${socialLinks.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 mt-1"
                        >
                          <Twitter className="w-3 h-3" />
                          <span>{socialLinks.twitter}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">
                        ${launch.initial_liquidity.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {format(new Date(launch.timestamp), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
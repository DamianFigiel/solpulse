import { useEffect, useState } from 'react';
import { Activity, Zap, DollarSign, Server, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface NetworkHealthData {
  slot: number;
  status: string;
  timestamp: number;
}

export default function NetworkHealth() {
  const [healthData, setHealthData] = useState<NetworkHealthData | null>(null);
  const { socket, subscribe, on, off } = useWebSocket();

  useEffect(() => {
    if (!socket) return;
    
    subscribe(['network-health']);
    on('health', (data: NetworkHealthData) => {
      setHealthData(data);
    });

    return () => {
      off('health');
    };
  }, [socket, subscribe, on, off]);

  const getCongestionColor = (congestion?: string) => {
    switch (congestion) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (value: number | undefined, decimals: number = 0) => {
    if (value === undefined || value === null) return '---';
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Network Health</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Current Slot</span>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              {healthData?.slot?.toLocaleString() || 'Loading...'}
            </span>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Network Status</span>
            <span className={`text-lg font-semibold ${healthData?.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
              {healthData?.status || 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
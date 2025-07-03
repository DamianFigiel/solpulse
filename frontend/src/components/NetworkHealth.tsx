import { useEffect, useState } from 'react';
import { Activity, Zap, DollarSign, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface NetworkHealthData {
  tps: number;
  avgFee: number;
  slot: number;
  congestion: 'low' | 'medium' | 'high';
}

export function NetworkHealth() {
  const [liveHealth, setLiveHealth] = useState<NetworkHealthData | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/network-stats`);
      return response.data;
    },
    refetchInterval: 10000,
  });

  const { data: health } = useQuery({
    queryKey: ['network-health'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/network-health`);
      return response.data as NetworkHealthData;
    },
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (health) {
      setLiveHealth(health);
    }
  }, [health]);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Network TPS</p>
          <p className="text-2xl font-bold text-primary-400">
            {liveHealth?.tps.toLocaleString() || '---'}
          </p>
        </div>
        <Activity className="w-8 h-8 text-primary-600" />
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Avg Fee (SOL)</p>
          <p className="text-2xl font-bold text-accent-500">
            {liveHealth?.avgFee.toFixed(6) || '---'}
          </p>
        </div>
        <DollarSign className="w-8 h-8 text-accent-600" />
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Current Slot</p>
          <p className="text-2xl font-bold text-gray-300">
            {liveHealth?.slot.toLocaleString() || '---'}
          </p>
        </div>
        <Server className="w-8 h-8 text-gray-600" />
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Network Status</p>
          <p className={`text-2xl font-bold capitalize ${getCongestionColor(liveHealth?.congestion)}`}>
            {liveHealth?.congestion || 'Unknown'}
          </p>
        </div>
        <Zap className={`w-8 h-8 ${getCongestionColor(liveHealth?.congestion)}`} />
      </div>
    </div>
  );
}
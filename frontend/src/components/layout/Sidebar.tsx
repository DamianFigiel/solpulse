import { useState, useEffect } from 'react';
import { TrendingUp, Image, Rocket, AlertCircle } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface NetworkHealth {
  slot: number;
  timestamp: number;
  isReal: boolean;
  fallback?: boolean;
}

interface SidebarProps {
  activeTab: 'dex' | 'nft' | 'tokens' | 'whales';
  setActiveTab: (tab: 'dex' | 'nft' | 'tokens' | 'whales') => void;
}

const tabs = [
  { id: 'dex' as const, label: 'DEX Swaps', icon: TrendingUp, description: 'Live trading activity across major DEXs' },
  { id: 'nft' as const, label: 'NFT Mints', icon: Image, description: 'Latest NFT collection launches' },
  { id: 'tokens' as const, label: 'Token Launches', icon: Rocket, description: 'New token launches' },
  { id: 'whales' as const, label: 'Whale Alerts', icon: AlertCircle, description: 'Large value transactions' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const { socket, isConnected } = useWebSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    // Subscribe to network health updates
    socket.emit('subscribe-network-health');
    
    // Listen for health updates
    socket.on('health', (data: NetworkHealth) => {
      setHealth(data);
    });
    
    return () => {
      socket.off('health');
      socket.emit('unsubscribe-network-health');
    };
  }, [socket]);
  
  return (
    <aside className="w-[420px] sidebar-bg min-h-screen">
      <nav className="p-10 space-y-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">Dashboard</h2>
          <div className="h-px bg-gradient-to-r from-primary-400 to-accent-500 opacity-40"></div>
        </div>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-6 p-7 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'sidebar-button-active' 
                  : 'sidebar-button'
              }`}
            >
              <Icon className={`w-9 h-9 transition-transform duration-300 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <div className="flex-1 text-left">
                <div className="font-bold text-xl mb-3">{tab.label}</div>
                <div className="text-lg opacity-70 leading-relaxed">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="px-10 pb-10 mt-8">
        <div className="glass-card p-12">
          <h3 className="text-3xl font-bold text-gray-100 mb-6">Quick Stats</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <span className="text-xl font-medium text-gray-300">Current Slot</span>
              </div>
              <span className="text-2xl font-bold text-gray-300">
                {health ? health.slot.toLocaleString() : '...'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <span className="text-xl font-medium text-gray-300">Network Status</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xl font-medium">{isConnected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </aside>
  );
}
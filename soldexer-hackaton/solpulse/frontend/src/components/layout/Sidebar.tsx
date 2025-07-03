import React from 'react';
import { TrendingUp, Image, Rocket, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: 'dex' | 'nft' | 'tokens' | 'whales';
  setActiveTab: (tab: 'dex' | 'nft' | 'tokens' | 'whales') => void;
}

const tabs = [
  { id: 'dex' as const, label: 'DEX Swaps', icon: TrendingUp },
  { id: 'nft' as const, label: 'NFT Mints', icon: Image },
  { id: 'tokens' as const, label: 'Token Launches', icon: Rocket },
  { id: 'whales' as const, label: 'Whale Alerts', icon: AlertCircle },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-dark-300 border-r border-gray-800 min-h-screen">
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-600/20'
                  : 'text-gray-400 hover:bg-dark-200/50 hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 mt-8">
        <div className="bg-dark-200/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs text-gray-500">
            <div>24h Volume: Loading...</div>
            <div>Active Traders: Loading...</div>
            <div>Network TPS: Loading...</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
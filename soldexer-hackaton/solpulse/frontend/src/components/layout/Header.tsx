import { Activity, Zap } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
}

export function Header({ connected }: HeaderProps) {
  return (
    <header className="bg-dark-300 border-b border-gray-800">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-accent-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            SolPulse
          </h1>
          <span className="text-sm text-gray-400">Real-time Solana Activity</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-gray-400">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Powered by Soldexer</span>
          </div>
        </div>
      </div>
    </header>
  );
}
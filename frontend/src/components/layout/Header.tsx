import { Activity, Zap } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function Header() {
  const { connected } = useWebSocket();
  
  return (
    <header className="header-bg sticky top-0 z-50">
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-10 h-10 text-accent-500 neon-glow" />
            <div>
              <h1 className="text-3xl font-bold text-gradient">SolPulse</h1>
              <p className="text-sm text-gray-400 font-medium">Real-time Solana Activity Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse shadow-lg`} />
            <span className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          
          <a 
            href="https://www.soldexer.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-accent-400 transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by Soldexer</span>
          </a>
        </div>
      </div>
    </header>
  );
}
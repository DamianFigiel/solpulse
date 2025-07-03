import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DexSwaps } from './components/DexSwaps';
import { NftMints } from './components/NftMints';
import { TokenLaunches } from './components/TokenLaunches';
import { WhaleAlerts } from './components/WhaleAlerts';
import { NetworkHealth } from './components/NetworkHealth';
import { useWebSocket } from './hooks/useWebSocket';

const queryClient = new QueryClient();

type Tab = 'dex' | 'nft' | 'tokens' | 'whales';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dex');
  const { connected } = useWebSocket();

  const renderContent = () => {
    switch (activeTab) {
      case 'dex':
        return <DexSwaps />;
      case 'nft':
        return <NftMints />;
      case 'tokens':
        return <TokenLaunches />;
      case 'whales':
        return <WhaleAlerts />;
      default:
        return <DexSwaps />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-dark-400 text-gray-100">
        <Header connected={connected} />
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-6">
            <NetworkHealth />
            <div className="mt-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
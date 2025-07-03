import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { Header } from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import { DexSwaps } from './components/DexSwaps'
import { NftMints } from './components/NftMints'
import { TokenLaunches } from './components/TokenLaunches'
import { WhaleAlerts } from './components/WhaleAlerts'

const queryClient = new QueryClient()

const components = {
  dex: DexSwaps,
  nft: NftMints,
  tokens: TokenLaunches,
  whales: WhaleAlerts
}

function App() {
  const [activeTab, setActiveTab] = useState<'dex' | 'nft' | 'tokens' | 'whales'>('dex')

  const ActiveComponent = components[activeTab] || components.dex

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-dark-800">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-12">
          <Header />
          <ActiveComponent />
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App

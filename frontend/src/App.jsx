
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  CoinbaseWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import HomePage from "./pages/HomePage";
import Tokenlaunchpad from "./pages/Tokenlaunchpad";
import SmartContract from "./pages/SmartContract";
import WalletTest from "./components/WalletTest";

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  // Set to 'devnet' for testing, 'mainnet-beta' for production
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tokenlaunchpad" element={<Tokenlaunchpad />} />
                <Route path="/smartcontract" element={<SmartContract />} />
                <Route path="/test" element={<WalletTest />} />
              </Routes>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;

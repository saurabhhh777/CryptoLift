import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected } = useWallet();

  const handleLogoClick = () => {
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        {/* Top Left - Website Name */}
        <div className="flex items-center mb-4 md:mb-0">
          <button 
            onClick={handleLogoClick}
            className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer"
          >
            CryptoLift
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6 mb-4 md:mb-0">
          <button
            onClick={() => navigate('/')}
            className={`text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/tokenlaunchpad')}
            className={`text-sm font-medium transition-colors ${
              isActive('/tokenlaunchpad') 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Token
          </button>
          <button
            onClick={() => navigate('/smartcontract')}
            className={`text-sm font-medium transition-colors ${
              isActive('/smartcontract') 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Smart Contract
          </button>
        </nav>

        {/* Top Right - Wallet Connection & Fee Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Token Creation Fee:</span> ~0.01 SOL
          </div>
          <WalletMultiButton className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Navbar; 
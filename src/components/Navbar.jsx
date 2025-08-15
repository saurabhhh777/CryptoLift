import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
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

        {/* Top Right - Wallet Connection & Fee Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Token Creation Fee:</span> ~0.002 SOL
          </div>
          <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 
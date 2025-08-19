import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('saurabhhhere@gmail.com');
    // You could add a toast notification here
  };

  const handleLaunchToken = () => {
    navigate('/tokenlaunchpad');
  };

  const handleViewSmartContract = () => {
    navigate('/smartcontract');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header Section */}
      <div className={isLoaded ? 'animate-fade-in' : ''}>
        <Navbar />
      </div>

            {/* Main Hero Section */}
      <div className="text-center mb-16 px-6 max-w-7xl mx-auto">
        {/* Grid Background with Content */}
        <div className="relative mb-12 py-16">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Launch your tokens on Solana with ease.
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CryptoLift is a decentralized platform that allows users to create, manage, and launch their own tokens effortlessly on the Solana blockchain.
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <button 
          onClick={handleLaunchToken}
          className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Launch Token</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Partner/Technology Section */}
      <section className={`px-6 py-12 bg-white ${isLoaded ? 'animate-fade-in' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">SOLANA</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">React.js</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">Tailwind CSS</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">Web3.js</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">SPL Token</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold text-lg">Vercel</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`px-6 py-16 ${isLoaded ? 'animate-fade-in' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to launch your token on Solana.
            </h2>
            <div className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              Features
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Token Creation */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Token Creation</h3>
              <p className="text-gray-600 leading-relaxed">
                Easily generate your own tokens on Solana with our intuitive interface.
              </p>
            </div>

            {/* Wallet Integration */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Wallet Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Supports Phantom and other Solana wallets for seamless transactions.
              </p>
            </div>

            {/* User-Friendly Interface */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">User-Friendly Interface</h3>
              <p className="text-gray-600 leading-relaxed">
                Intuitive UI for smooth navigation and token management.
              </p>
            </div>

            {/* No Backend Required */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Backend Required</h3>
              <p className="text-gray-600 leading-relaxed">
                Fully client-side implementation for maximum decentralization.
              </p>
            </div>

            {/* Smart Contract Integration */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Contract</h3>
              <p className="text-gray-600 leading-relaxed">
                Secure smart contract with automatic fee collection and token management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className={`px-6 py-16 bg-white ${isLoaded ? 'animate-fade-in' : ''}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Ready to launch your token?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleLaunchToken}
              className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Token</span>
            </button>
            
            <button 
              onClick={handleViewSmartContract}
              className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View Smart Contract</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`px-6 py-8 border-t border-gray-200 ${isLoaded ? 'animate-fade-in' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            © 2024 CryptoLift. All rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Token creation requires SOL for transaction fees
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 
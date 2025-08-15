import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MINT_SIZE, createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Navbar from '../components/Navbar';

const Tokenlaunchpad = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [formdata, setFormdata] = useState({
    tokenname: "",
    symbol: "",
    imageUrl: "",
    initialSupply: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function createToken() {
    if (!wallet.connected) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!formdata.tokenname || !formdata.symbol || !formdata.initialSupply) {
      setStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setStatus("Creating your token...");

    try {
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const keypair = Keypair.generate();

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(keypair.publicKey, 6, wallet.publicKey, wallet.publicKey, TOKEN_PROGRAM_ID)
      );

      const recentBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;

      transaction.partialSign(keypair);
      let response = await wallet.sendTransaction(transaction, connection);
      console.log(response);
      setStatus("Token created successfully! Transaction: " + response.signature);
    } catch (error) {
      console.error("Error creating token:", error);
      setStatus("Error creating token: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Create Your Token
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Launch your own token on the Solana blockchain with our easy-to-use platform.
            </p>
          </div>

          {/* Wallet Connection Status */}
          {!wallet.connected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">Please connect your wallet to create a token</span>
              </div>
            </div>
          )}

          {/* Token Creation Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Token Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="tokenname"
                  value={formdata.tokenname}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="e.g., My Awesome Token"
                  disabled={isLoading}
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Symbol *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="symbol"
                  value={formdata.symbol}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="e.g., MAT"
                  disabled={isLoading}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="imageUrl"
                  value={formdata.imageUrl}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="https://example.com/token-image.png"
                  disabled={isLoading}
                />
              </div>

              {/* Initial Supply */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Supply *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="initialSupply"
                  value={formdata.initialSupply}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="1000000"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`mt-6 p-4 rounded-lg ${
                status.includes("Error") 
                  ? "bg-red-50 border border-red-200 text-red-800" 
                  : status.includes("successfully") 
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}>
                <div className="flex items-center">
                  {status.includes("Error") ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : status.includes("successfully") ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{status}</span>
                </div>
              </div>
            )}

            {/* Create Token Button */}
            <div className="mt-8">
              <button 
                onClick={createToken} 
                disabled={isLoading || !wallet.connected}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 ${
                  isLoading || !wallet.connected
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Creating Token...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Token</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Make sure your wallet is connected before creating a token
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll need SOL for transaction fees
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Token creation is irreversible - double-check all details
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            © 2024 CryptoLift. All rights reserved.
          </div>
          <div className="flex space-x-6 text-gray-700">
            <a href="https://www.linkedin.com/in/saurabh-maurya-92b727245/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">LinkedIn</a>
            <a href="https://twitter.com/saurabhhh777" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Twitter</a>
            <a href="https://github.com/saurabhhh777/CryptoLift" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Tokenlaunchpad;

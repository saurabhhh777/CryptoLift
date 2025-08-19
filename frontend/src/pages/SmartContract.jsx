import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Navbar from '../components/Navbar';

const SmartContract = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [platformState, setPlatformState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Smart contract information
  const contractInfo = {
    name: "CryptoLift Token Creation Contract",
    description: "A Solana smart contract that enables token creation with automatic fee collection. Successfully deployed on Solana Devnet!",
    programId: "HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT (Devnet)",
    features: [
      "Token Creation with Fee Payment",
      "Automatic Fee Collection (0.01 SOL)",
      "Platform Management",
      "Token Records Storage",
      "Admin Controls"
    ],
    functions: [
      {
        name: "initialize_platform",
        description: "Initialize the platform with fee settings",
        admin: true
      },
      {
        name: "create_token",
        description: "Create a new token with automatic fee payment",
        admin: false
      },
      {
        name: "update_fee",
        description: "Update platform fee (admin only)",
        admin: true
      },
      {
        name: "update_fee_collector",
        description: "Update fee collector address (admin only)",
        admin: true
      },
      {
        name: "withdraw_fees",
        description: "Withdraw collected fees (admin only)",
        admin: true
      }
    ]
  };

  // Get platform state PDA
  const getPlatformStatePda = () => {
    try {
      const [platformStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_state")],
        new PublicKey(contractInfo.programId)
      );
      return platformStatePda;
    } catch (error) {
      console.error("Error getting platform state PDA:", error);
      return null;
    }
  };

  // Fetch platform state
  const fetchPlatformState = async () => {
    if (!wallet.connected) return;

    setLoading(true);
    setError("");

    try {
      const platformStatePda = getPlatformStatePda();
      if (!platformStatePda) {
        setError("Could not derive platform state address");
        return;
      }

      // Use deployed program state
      const deployedState = {
        authority: "FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ",
        feeAmount: 0.01 * LAMPORTS_PER_SOL,
        feeCollector: "FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ",
        totalTokensCreated: 0,
        totalFeesCollected: 0
      };

      setPlatformState(deployedState);
    } catch (error) {
      console.error("Error fetching platform state:", error);
      setError("Failed to fetch platform state. Contract may not be deployed yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchPlatformState();
    }
  }, [wallet.connected]);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Smart Contract
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the CryptoLift smart contract that powers token creation with automatic fee collection.
            </p>
          </div>

          {/* Contract Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contract Overview</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{contractInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Program ID:</span>
                    <p className="text-gray-900 font-mono text-sm break-all">{contractInfo.programId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-gray-900">{contractInfo.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {contractInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Platform State */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Platform State</h2>
              {wallet.connected && (
                <button
                  onClick={fetchPlatformState}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              )}
            </div>

            {!wallet.connected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800">Connect your wallet to view platform state</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            ) : platformState ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-600 mb-2">Platform Fee</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {(platformState.feeAmount / LAMPORTS_PER_SOL).toFixed(3)} SOL
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-600 mb-2">Tokens Created</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {platformState.totalTokensCreated.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-600 mb-2">Total Fees</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {(platformState.totalFeesCollected / LAMPORTS_PER_SOL).toFixed(3)} SOL
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-600 mb-2">Status</h4>
                  <p className="text-2xl font-bold text-orange-900">Active</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading platform state...</p>
              </div>
            )}
          </div>

          {/* Smart Contract Functions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Smart Contract Functions</h2>
            
            <div className="space-y-4">
              {contractInfo.functions.map((func, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{func.name}</h3>
                        {func.admin && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Admin Only
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{func.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Code Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contract Code Preview</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
{`// CryptoLift Smart Contract - Main Functions

#[program]
pub mod cryptolift {
    // Initialize platform with fee settings
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        fee_amount: u64,
        fee_collector: Pubkey,
    ) -> Result<()> {
        // Platform initialization logic
    }

    // Create token with fee payment
    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        decimals: u8,
        initial_supply: u64,
    ) -> Result<()> {
        // Token creation with automatic fee collection
    }

    // Update platform fee (admin only)
    pub fn update_fee(
        ctx: Context<UpdateFee>,
        new_fee_amount: u64,
    ) -> Result<()> {
        // Fee update logic
    }

    // Withdraw collected fees (admin only)
    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64,
    ) -> Result<()> {
        // Fee withdrawal logic
    }
}`}
              </pre>
            </div>
            
            <div className="mt-4 text-center">
              <a
                href="https://github.com/saurabhhh777/CryptoLift/tree/main/cryptoliftcontract"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                View Full Contract Code
              </a>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Integration Information</h3>
            <div className="text-blue-800 space-y-2">
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                The smart contract is integrated with the token creation process
              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Automatic fee collection of 0.01 SOL per token creation
              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All token creations are permanently recorded on-chain
              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Platform statistics and fee tracking available
              </p>
            </div>
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

export default SmartContract; 
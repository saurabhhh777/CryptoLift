import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const WalletTest = () => {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [testStatus, setTestStatus] = useState('');

  const testTransaction = async () => {
    if (!connected || !publicKey) {
      setTestStatus('Please connect wallet first');
      return;
    }

    try {
      setTestStatus('Testing transaction...');
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      
      // Create a simple transaction (transfer 0.001 SOL to self)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1000, // 0.001 SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTestStatus(`Test transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error('Test transaction error:', error);
      setTestStatus(`Test transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Wallet Connection Test</h2>
      
      <div className="space-y-2 mb-4">
        <p><strong>Connected:</strong> {connected ? '✅ Yes' : '❌ No'}</p>
        {publicKey && (
          <p><strong>Public Key:</strong> {publicKey.toString()}</p>
        )}
        {testStatus && (
          <p><strong>Test Status:</strong> {testStatus}</p>
        )}
      </div>

      <div className="space-y-2">
        <WalletMultiButton />
        {connected && (
          <>
            <button
              onClick={testTransaction}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Transaction
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletTest; 
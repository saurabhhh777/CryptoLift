import { useState } from "react";
import { 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import Navbar from '../components/Navbar';
import { 
  getInstructionDiscriminator, 
  stringToBuffer, 
  numberToBuffer 
} from '../utils/cryptoUtils';

const Tokenlaunchpad = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  // Deployed program information
  const PROGRAM_ID = new PublicKey("HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT");
  const PLATFORM_STATE_PDA = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");
  const FEE_COLLECTOR = new PublicKey("FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ");
  const FEE_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

  const [formdata, setFormdata] = useState({
    tokenname: "",
    symbol: "",
    imageUrl: "",
    initialSupply: "",
    decimals: "6"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Generate instruction discriminator for create_token
  const getCreateTokenDiscriminator = async () => {
    const discriminator = await getInstructionDiscriminator('create_token');
    const discriminatorHex = Array.from(discriminator).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log("Generated discriminator for 'create_token':", discriminatorHex);
    console.log("Expected discriminator: 77c9652d4b7a5903");
    console.log("Match:", discriminatorHex === "77c9652d4b7a5903" ? "✅ YES" : "❌ NO");
    return discriminator;
  };

  const createToken = async () => {
    if (!wallet.connected) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!formdata.tokenname || !formdata.symbol || !formdata.initialSupply || !formdata.decimals) {
      setStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setStatus("Creating token...");

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");

      // Check wallet balance for fee
      const balance = await connection.getBalance(wallet.publicKey);
      console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");
      
      if (balance < FEE_AMOUNT + 0.02 * LAMPORTS_PER_SOL) { // Add extra for transaction fees and account creation
        setStatus("Insufficient balance. You need at least 0.03 SOL for fee, account creation, and transaction costs.");
        return;
      }

      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      console.log("Mint keypair generated:", mintKeypair.publicKey.toString());

      // Create a temporary fee payment account owned by the program
      const feePaymentKeypair = Keypair.generate();
      console.log("Fee payment keypair generated:", feePaymentKeypair.publicKey.toString());

      // Get associated token account
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      console.log("Associated token account:", associatedTokenAccount.toString());

      // Get token record PDA
      const [tokenRecordPda] = PublicKey.findProgramAddressSync(
        [stringToBuffer("token_record"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );
      console.log("Token record PDA:", tokenRecordPda.toString());

      // Create instruction data for create_token
      const createTokenDiscriminator = await getCreateTokenDiscriminator();
      console.log("Create token discriminator:", Array.from(createTokenDiscriminator).map(b => b.toString(16).padStart(2, '0')).join(''));
      
      // Serialize parameters: token_name (String) + token_symbol (String) + decimals (u8) + initial_supply (u64)
      const tokenNameBuffer = stringToBuffer(formdata.tokenname);
      const tokenNameLengthBuffer = numberToBuffer(tokenNameBuffer.length, 4);
      
      const tokenSymbolBuffer = stringToBuffer(formdata.symbol);
      const tokenSymbolLengthBuffer = numberToBuffer(tokenSymbolBuffer.length, 4);
      
      const decimalsBuffer = numberToBuffer(parseInt(formdata.decimals), 1);
      const initialSupplyBuffer = numberToBuffer(parseInt(formdata.initialSupply), 8);

      const instructionData = new Uint8Array([
        ...createTokenDiscriminator,
        ...tokenNameLengthBuffer,
        ...tokenNameBuffer,
        ...tokenSymbolLengthBuffer,
        ...tokenSymbolBuffer,
        ...decimalsBuffer,
        ...initialSupplyBuffer
      ]);

      console.log("Instruction data length:", instructionData.length);
      console.log("Form data:", formdata);

      // Create transaction
      const transaction = new Transaction();

      // Add instruction to create fee payment account owned by System Program
      const createFeeAccountInstruction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: feePaymentKeypair.publicKey,
        lamports: FEE_AMOUNT,
        space: 0, // No data needed
        programId: SystemProgram.programId, // Owned by System Program
      });

      transaction.add(createFeeAccountInstruction);

      // Add create_token instruction (smart contract will handle mint and token account creation)
      const createTokenInstruction = {
        keys: [
          { pubkey: PLATFORM_STATE_PDA, isSigner: false, isWritable: true }, // platform_state
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true }, // mint
          { pubkey: associatedTokenAccount, isSigner: false, isWritable: true }, // token_account
          { pubkey: tokenRecordPda, isSigner: false, isWritable: true }, // token_record
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // creator
          { pubkey: feePaymentKeypair.publicKey, isSigner: false, isWritable: true }, // fee_payment
          { pubkey: FEE_COLLECTOR, isSigner: false, isWritable: true }, // fee_collector
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
          { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false }, // rent
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      };

      console.log("Create token instruction accounts:");
      const accountNames = [
        "platform_state", "mint", "token_account", "token_record", 
        "creator", "fee_payment", "fee_collector", "associated_token_program", 
        "token_program", "system_program", "rent"
      ];
      createTokenInstruction.keys.forEach((key, index) => {
        console.log(`${index}: ${accountNames[index]} - ${key.pubkey.toString()} (signer: ${key.isSigner}, writable: ${key.isWritable})`);
      });

      transaction.add(createTokenInstruction);

      console.log("Transaction created with", transaction.instructions.length, "instructions");

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign the transaction with the keypairs
      transaction.sign(mintKeypair, feePaymentKeypair);
      console.log("Transaction signed with mint and fee payment keypairs");

      // Simulate transaction first to catch errors
      try {
        const simulation = await connection.simulateTransaction(transaction);
        console.log("Transaction simulation result:", simulation);
        if (simulation.value.err) {
          console.error("Simulation error details:", simulation.value.err);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }
        console.log("Transaction simulation successful");
      } catch (simError) {
        console.error("Transaction simulation error:", simError);
        console.error("Full simulation error object:", simError);
        throw new Error(`Transaction simulation failed: ${simError.message}`);
      }

      // Send transaction - wallet will sign automatically
      setStatus("Sending transaction...");
      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction sent with signature:", signature);
      setStatus("Transaction sent! Waiting for confirmation...");

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      setStatus(`Token created successfully! Fee paid: ${FEE_AMOUNT / LAMPORTS_PER_SOL} SOL. Transaction: ${signature}`);
      
      // Reset form
      setFormdata({
        tokenname: "",
        symbol: "",
        imageUrl: "",
        initialSupply: "",
        decimals: "6"
      });

    } catch (error) {
      console.error("Error creating token:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
              Launch your own token on the Solana blockchain with our CryptoLift platform.
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-blue-800 font-medium">
                Platform Fee: 0.01 SOL per token creation
              </p>
            </div>
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

              {/* Decimals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimals *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="decimals"
                  value={formdata.decimals}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="0">0 (Whole numbers only)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6 (Recommended)</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                </select>
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

              {/* Image URL */}
              <div className="md:col-span-2">
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
                    <span>Create Token (0.01 SOL Fee)</span>
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
                Platform fee of 0.01 SOL will be automatically deducted
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll need at least 0.02 SOL for fee and transaction costs
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Token creation is irreversible - double-check all details
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your token will be created using the CryptoLift smart contract
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

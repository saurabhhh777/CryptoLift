import { useState } from "react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import Navbar from "../components/Navbar";
import {
  getInstructionDiscriminator,
  stringToBuffer,
  numberToBuffer,
} from "../utils/cryptoUtils";

const Tokenlaunchpad = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  // Program config
  const PROGRAM_ID = new PublicKey("HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT");
  const PLATFORM_STATE_PDA = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");
  const FEE_COLLECTOR = new PublicKey("FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ");
  const FEE_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

  const [formdata, setFormdata] = useState({
    tokenname: "",
    symbol: "",
    imageUrl: "",
    initialSupply: "",
    decimals: "6",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Discriminator for `create_token`
  const getCreateTokenDiscriminator = async () => {
    const discriminator = await getInstructionDiscriminator("create_token");
    return discriminator; // expected 77c9652d4b7a5903 (per your logs)
  };

  const createToken = async () => {
    console.log("=== TOKEN CREATION STARTED ===");
    console.log("Wallet connected:", wallet.connected);
    console.log("Wallet public key:", wallet.publicKey?.toString());
    
    if (!wallet.connected) {
      setStatus("Please connect your wallet first");
      return;
    }
    
    console.log("Form data:", formdata);
    if (
      !formdata.tokenname ||
      !formdata.symbol ||
      !formdata.initialSupply ||
      !formdata.decimals
    ) {
      setStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setStatus("Creating token...");

    try {
      // Use a fresh connection (or the one from the adapter—either is fine)
      const conn = new Connection("https://api.devnet.solana.com", "confirmed");
      console.log("Connection established");

      // Check balance roughly covers fee + tx
      const balance = await conn.getBalance(wallet.publicKey);
      console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");
      console.log("Required balance:", (FEE_AMOUNT + 0.02 * LAMPORTS_PER_SOL) / LAMPORTS_PER_SOL, "SOL");
      
      if (balance < FEE_AMOUNT + 0.02 * LAMPORTS_PER_SOL) {
        setStatus(
          "Insufficient balance. You need at least ~0.03 SOL for fee & tx costs."
        );
        setIsLoading(false);
        return;
      }

      // Generate mint keypair (must sign the tx)
      const mintKeypair = Keypair.generate();
      console.log("Mint keypair generated:", mintKeypair.publicKey.toString());

      // Derive ATA (Anchor will create; we pass the address for logs/debug only)
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      console.log("Associated token account:", associatedTokenAccount.toString());

      // Token record PDA (must match program seeds)
      const [tokenRecordPda] = PublicKey.findProgramAddressSync(
        [stringToBuffer("token_record"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );
      console.log("Token record PDA:", tokenRecordPda.toString());

      // Serialize instruction data for Anchor:
      // [8-byte discriminator][name_len: u32][name bytes][sym_len: u32][sym bytes][decimals: u8][initial_supply: u64]
      const disc = await getCreateTokenDiscriminator();
      const nameBuf = stringToBuffer(formdata.tokenname);
      const nameLen = numberToBuffer(nameBuf.length, 4);
      const symBuf = stringToBuffer(formdata.symbol);
      const symLen = numberToBuffer(symBuf.length, 4);
      const decimalsBuf = numberToBuffer(parseInt(formdata.decimals), 1);
      const initSupplyBuf = numberToBuffer(
        BigInt(formdata.initialSupply),
        8 // u64
      );

      const data = new Uint8Array([
        ...disc,
        ...nameLen,
        ...nameBuf,
        ...symLen,
        ...symBuf,
        ...decimalsBuf,
        ...initSupplyBuf,
      ]);
      
      console.log("Instruction data length:", data.length);
      console.log("Instruction data (hex):", Buffer.from(data).toString('hex'));

      // Build the instruction to your program.
      // IMPORTANT: account order MUST match the Anchor Context<CreateToken> struct.
      const createTokenIx = {
        keys: [
          // 0 platform_state
          { pubkey: PLATFORM_STATE_PDA, isSigner: false, isWritable: true },
          // 1 mint (created by Anchor; must be signer for init)
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
          // 2 token_account (ATA created by Anchor)
          { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
          // 3 token_record (PDA)
          { pubkey: tokenRecordPda, isSigner: false, isWritable: true },
          // 4 creator (signer pays fees and tx)
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          // 5 fee_collector (receives SOL in CPI)
          { pubkey: FEE_COLLECTOR, isSigner: false, isWritable: true },
          // 6 associated_token_program
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          // 7 token_program
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          // 8 system_program
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          // 9 rent
          { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      };
      
      console.log("=== INSTRUCTION ACCOUNTS ===");
      const accountNames = [
        "platform_state", "mint", "token_account", "token_record", 
        "creator", "fee_collector", "associated_token_program", 
        "token_program", "system_program", "rent"
      ];
      createTokenIx.keys.forEach((key, index) => {
        console.log(`${index}: ${accountNames[index]} - ${key.pubkey.toString()} (signer: ${key.isSigner}, writable: ${key.isWritable})`);
      });

      const tx = new Transaction().add(createTokenIx);
      console.log("Transaction created with", tx.instructions.length, "instructions");

      // Recent blockhash & fee payer
      const { blockhash } = await conn.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;
      console.log("Transaction fee payer:", wallet.publicKey.toString());

      // Sign with the mint keypair (Anchor init requires the account's signature)
      tx.sign(mintKeypair);
      console.log("Transaction signed with mint keypair");

      // (Optional) simulate to catch errors early
      try {
        console.log("=== SIMULATING TRANSACTION ===");
        const sim = await conn.simulateTransaction(tx);
        console.log("Simulation result:", sim);
        if (sim.value.err) {
          console.error("Simulation error details:", sim.value.err);
          console.error("Simulation logs:", sim.value.logs);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(sim.value.err)}`);
        }
        console.log("✅ Transaction simulation successful");
      } catch (e) {
        console.error("❌ Transaction simulation error:", e);
        throw e;
      }

            console.log("=== SENDING TRANSACTION ===");
      setStatus("Sending transaction...");
      const sig = await wallet.sendTransaction(tx, conn, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      console.log("Transaction sent with signature:", sig);

      setStatus("Transaction sent! Waiting for confirmation...");
      console.log("Waiting for confirmation...");
      const conf = await conn.confirmTransaction(sig, "confirmed");
      console.log("Confirmation result:", conf);
      if (conf.value.err) throw new Error(`Transaction failed: ${conf.value.err}`);

      console.log("✅ Token created successfully!");
      setStatus(
        `Token created successfully! Fee paid: ${FEE_AMOUNT / LAMPORTS_PER_SOL} SOL. Tx: ${sig}`
      );

      // Reset form
      setFormdata({
        tokenname: "",
        symbol: "",
        imageUrl: "",
        initialSupply: "",
        decimals: "6",
      });
        } catch (error) {
      console.error("❌ Error creating token:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setStatus("Error creating token: " + error.message);
    } finally {
      setIsLoading(false);
      console.log("=== TOKEN CREATION ENDED ===");
    }
  };

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Navbar />
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Name *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decimals *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  name="decimals"
                  value={formdata.decimals}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Supply *</label>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
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

            {status && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  status.includes("Error")
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : status.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="font-medium">{status}</span>
                </div>
              </div>
            )}

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

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
            <ul className="text-blue-800 space-y-2">
              <li>Platform fee of 0.01 SOL will be automatically deducted</li>
              <li>You'll need at least 0.02–0.03 SOL for fee and transaction costs</li>
              <li>Token creation is irreversible - double-check all details</li>
              <li>Your token will be created using the CryptoLift smart contract</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">© 2024 CryptoLift. All rights reserved.</div>
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

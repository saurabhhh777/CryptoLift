const { Connection, PublicKey } = require('@solana/web3.js');

const PROGRAM_ID = new PublicKey("HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT");
const PLATFORM_STATE_PDA = new PublicKey("2SA1br9zQYN6JC3fZVDgDHStTC1rtz9G8hSCkh71WqZW");

async function readPlatformState() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  try {
    const accountInfo = await connection.getAccountInfo(PLATFORM_STATE_PDA);
    
    if (!accountInfo) {
      console.log("❌ Platform state account not found");
      return;
    }
    
    console.log("✅ Platform state account found");
    console.log("Account data length:", accountInfo.data.length);
    console.log("Account data (hex):", accountInfo.data.toString('hex'));
    
    // Try to decode the data
    // PlatformState structure: authority (32) + fee_amount (8) + fee_collector (32) + total_tokens_created (8) + total_fees_collected (8)
    const data = accountInfo.data;
    
    if (data.length >= 88) {
      const authority = new PublicKey(data.slice(0, 32));
      const feeAmount = data.readBigUInt64LE(32);
      const feeCollector = new PublicKey(data.slice(40, 72));
      const totalTokensCreated = data.readBigUInt64LE(72);
      const totalFeesCollected = data.readBigUInt64LE(80);
      
      console.log("\n📊 Platform State Data:");
      console.log("Authority:", authority.toString());
      console.log("Fee Amount:", feeAmount.toString(), "lamports");
      console.log("Fee Collector:", feeCollector.toString());
      console.log("Total Tokens Created:", totalTokensCreated.toString());
      console.log("Total Fees Collected:", totalFeesCollected.toString());
      
      console.log("\n🔍 Expected vs Actual:");
      console.log("Expected Fee Collector:", "FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ");
      console.log("Actual Fee Collector:", feeCollector.toString());
      console.log("Match:", feeCollector.toString() === "FiULaF42tPHhrQwvbKUnpjHdXGytQPos7Sp3nVcikqGQ" ? "✅ YES" : "❌ NO");
    } else {
      console.log("❌ Account data too short to decode");
    }
    
  } catch (error) {
    console.error("❌ Error reading platform state:", error);
  }
}

readPlatformState(); 
const { Connection, PublicKey, Keypair, SystemProgram, Transaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');

// Configuration
const PROGRAM_ID = new PublicKey("HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT");
const FEE_COLLECTOR = new PublicKey("11111111111111111111111111111111");
const FEE_AMOUNT = 10000000; // 0.01 SOL

async function testDeployedProgram() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Create test keypairs
  const testWallet = Keypair.generate();
  const mintKeypair = Keypair.generate();
  
  console.log("Test wallet:", testWallet.publicKey.toString());
  console.log("Mint:", mintKeypair.publicKey.toString());
  
  // Get platform state PDA
  const [platformStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('platform_state')],
    PROGRAM_ID
  );
  
  // Get token record PDA
  const [tokenRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_record'), mintKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  );
  
  // Get associated token account
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    testWallet.publicKey,
    false
  );
  
  console.log("Platform state PDA:", platformStatePda.toString());
  console.log("Token record PDA:", tokenRecordPda.toString());
  console.log("Associated token account:", associatedTokenAccount.toString());
  
  // Create a simple instruction to test the account structure
  const testIx = {
    keys: [
      { pubkey: platformStatePda, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
      { pubkey: tokenRecordPda, isSigner: false, isWritable: true },
      { pubkey: testWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: testWallet.publicKey, isSigner: false, isWritable: true }, // fee_payment
      { pubkey: FEE_COLLECTOR, isSigner: false, isWritable: true },
      { pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: false },
      { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]) // Dummy data
  };
  
  const tx = new Transaction().add(testIx);
  
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = testWallet.publicKey;
    
    tx.sign(mintKeypair);
    
    console.log("Simulating transaction...");
    const sim = await connection.simulateTransaction(tx);
    console.log("Simulation result:", sim);
    
    if (sim.value.err) {
      console.error("Simulation error:", sim.value.err);
      console.error("Simulation logs:", sim.value.logs);
    } else {
      console.log("Simulation successful!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testDeployedProgram().catch(console.error); 
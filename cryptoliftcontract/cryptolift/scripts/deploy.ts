import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cryptolift } from "../target/types/cryptolift";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Cryptolift as Program<Cryptolift>;
  const provider = anchor.getProvider();

  console.log("🚀 Deploying CryptoLift Smart Contract...");
  console.log("Program ID:", program.programId.toString());

  // Generate platform authority (you can replace this with your own keypair)
  const authority = Keypair.generate();
  console.log("Platform Authority:", authority.publicKey.toString());

  // Generate fee collector (you can replace this with your own keypair)
  const feeCollector = Keypair.generate();
  console.log("Fee Collector:", feeCollector.publicKey.toString());

  // Platform state PDA
  const [platformStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_state")],
    program.programId
  );
  console.log("Platform State PDA:", platformStatePda.toString());

  try {
    // Airdrop SOL to authority and fee collector for testing
    console.log("💰 Airdropping SOL to test accounts...");
    
    const signature1 = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature1);
    console.log("✅ Airdropped 2 SOL to authority");

    const signature2 = await provider.connection.requestAirdrop(
      feeCollector.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature2);
    console.log("✅ Airdropped 1 SOL to fee collector");

    // Set fee amount (0.01 SOL = 10,000,000 lamports)
    const feeAmount = 0.01 * LAMPORTS_PER_SOL;
    console.log("💸 Setting platform fee to:", feeAmount / LAMPORTS_PER_SOL, "SOL");

    // Initialize the platform
    console.log("🔧 Initializing platform...");
    const tx = await program.methods
      .initializePlatform(feeAmount, feeCollector.publicKey)
      .accounts({
        platformState: platformStatePda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Platform initialized successfully!");
    console.log("Transaction signature:", tx);

    // Verify platform state
    const platformState = await program.account.platformState.fetch(platformStatePda);
    console.log("\n📊 Platform State:");
    console.log("- Authority:", platformState.authority.toString());
    console.log("- Fee Amount:", platformState.feeAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("- Fee Collector:", platformState.feeCollector.toString());
    console.log("- Total Tokens Created:", platformState.totalTokensCreated.toNumber());
    console.log("- Total Fees Collected:", platformState.totalFeesCollected.toNumber());

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. Save the authority keypair for admin operations");
    console.log("2. Update your frontend to use the new program ID");
    console.log("3. Test token creation with fee payment");
    console.log("4. Deploy to devnet/mainnet when ready");

    // Save important addresses to a file
    const deploymentInfo = {
      programId: program.programId.toString(),
      platformStatePda: platformStatePda.toString(),
      authority: authority.publicKey.toString(),
      feeCollector: feeCollector.publicKey.toString(),
      feeAmount: feeAmount,
      network: provider.connection.rpcEndpoint,
      deploymentDate: new Date().toISOString(),
    };

    console.log("\n💾 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 
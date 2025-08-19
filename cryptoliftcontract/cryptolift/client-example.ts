import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cryptolift } from "./target/types/cryptolift";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// CryptoLift Client Class
export class CryptoLiftClient {
  private program: Program<Cryptolift>;
  private provider: anchor.AnchorProvider;

  constructor(connection: anchor.web3.Connection, wallet: anchor.Wallet) {
    this.provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(this.provider);
    this.program = anchor.workspace.Cryptolift as Program<Cryptolift>;
  }

  // Get platform state PDA
  getPlatformStatePda(): PublicKey {
    const [platformStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_state")],
      this.program.programId
    );
    return platformStatePda;
  }

  // Get token record PDA
  getTokenRecordPda(mint: PublicKey): PublicKey {
    const [tokenRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_record"), mint.toBuffer()],
      this.program.programId
    );
    return tokenRecordPda;
  }

  // Get platform state
  async getPlatformState() {
    const platformStatePda = this.getPlatformStatePda();
    return await this.program.account.platformState.fetch(platformStatePda);
  }

  // Create token with fee payment
  async createToken(
    tokenName: string,
    tokenSymbol: string,
    decimals: number,
    initialSupply: number
  ) {
    const user = this.provider.wallet.publicKey;
    
    // Create mint account
    const mint = Keypair.generate();
    
    // Get associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      user
    );

    // Get PDAs
    const platformStatePda = this.getPlatformStatePda();
    const tokenRecordPda = this.getTokenRecordPda(mint.publicKey);

    // Get platform state to know fee collector
    const platformState = await this.getPlatformState();

    console.log("Creating token with fee payment...");
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Fee Amount:", platformState.feeAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");

    try {
      const tx = await this.program.methods
        .createToken(tokenName, tokenSymbol, decimals, new anchor.BN(initialSupply))
        .accounts({
          platformState: platformStatePda,
          mint: mint.publicKey,
          tokenAccount: tokenAccount,
          tokenRecord: tokenRecordPda,
          creator: user,
          feePayment: user,
          feeCollector: platformState.feeCollector,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      console.log("✅ Token created successfully!");
      console.log("Transaction signature:", tx);
      console.log("Mint address:", mint.publicKey.toString());
      console.log("Token account:", tokenAccount.toString());

      return {
        success: true,
        transaction: tx,
        mint: mint.publicKey.toString(),
        tokenAccount: tokenAccount.toString(),
        tokenRecord: tokenRecordPda.toString(),
      };
    } catch (error) {
      console.error("❌ Failed to create token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get token record
  async getTokenRecord(mint: PublicKey) {
    const tokenRecordPda = this.getTokenRecordPda(mint);
    return await this.program.account.tokenRecord.fetch(tokenRecordPda);
  }

  // Update platform fee (admin only)
  async updateFee(newFeeAmount: number) {
    const platformStatePda = this.getPlatformStatePda();
    
    try {
      const tx = await this.program.methods
        .updateFee(newFeeAmount)
        .accounts({
          platformState: platformStatePda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log("✅ Platform fee updated successfully!");
      console.log("New fee:", newFeeAmount / LAMPORTS_PER_SOL, "SOL");
      console.log("Transaction signature:", tx);

      return {
        success: true,
        transaction: tx,
      };
    } catch (error) {
      console.error("❌ Failed to update fee:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update fee collector (admin only)
  async updateFeeCollector(newFeeCollector: PublicKey) {
    const platformStatePda = this.getPlatformStatePda();
    
    try {
      const tx = await this.program.methods
        .updateFeeCollector(newFeeCollector)
        .accounts({
          platformState: platformStatePda,
          authority: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log("✅ Fee collector updated successfully!");
      console.log("New fee collector:", newFeeCollector.toString());
      console.log("Transaction signature:", tx);

      return {
        success: true,
        transaction: tx,
      };
    } catch (error) {
      console.error("❌ Failed to update fee collector:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Withdraw fees (admin only)
  async withdrawFees(amount: number) {
    const platformStatePda = this.getPlatformStatePda();
    const platformState = await this.getPlatformState();
    
    try {
      const tx = await this.program.methods
        .withdrawFees(amount)
        .accounts({
          platformState: platformStatePda,
          authority: this.provider.wallet.publicKey,
          feeCollector: platformState.feeCollector,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Fees withdrawn successfully!");
      console.log("Amount withdrawn:", amount / LAMPORTS_PER_SOL, "SOL");
      console.log("Transaction signature:", tx);

      return {
        success: true,
        transaction: tx,
      };
    } catch (error) {
      console.error("❌ Failed to withdraw fees:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Example usage
async function example() {
  // Setup connection and wallet (replace with your actual setup)
  const connection = new anchor.web3.Connection("http://localhost:8899");
  const wallet = new anchor.Wallet(Keypair.generate()); // Replace with actual wallet
  
  const client = new CryptoLiftClient(connection, wallet);

  // Get platform state
  const platformState = await client.getPlatformState();
  console.log("Platform Fee:", platformState.feeAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");

  // Create a token
  const result = await client.createToken(
    "My Awesome Token",
    "MAT",
    6,
    1000000
  );

  if (result.success) {
    console.log("Token created:", result.mint);
    
    // Get token record
    const tokenRecord = await client.getTokenRecord(new PublicKey(result.mint));
    console.log("Token Name:", tokenRecord.tokenName);
    console.log("Token Symbol:", tokenRecord.tokenSymbol);
  }
}

// Example usage function
export { example }; 
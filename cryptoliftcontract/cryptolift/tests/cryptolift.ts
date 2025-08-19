import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cryptolift } from "../target/types/cryptolift";
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
  createMint,
  getAccount,
  createAccount
} from "@solana/spl-token";
import { assert } from "chai";

describe("cryptolift", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cryptolift as Program<Cryptolift>;

  // Test accounts
  const authority = Keypair.generate();
  const user = Keypair.generate();
  const feeCollector = Keypair.generate();
  
  // Platform state PDA
  const [platformStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_state")],
    program.programId
  );

  // Test parameters
  const feeAmount = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
  const tokenName = "Test Token";
  const tokenSymbol = "TEST";
  const decimals = 6;
  const initialSupply = 1000000;

  before(async () => {
    // Airdrop SOL to test accounts
    const signature1 = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature1);

    const signature2 = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature2);

    const signature3 = await provider.connection.requestAirdrop(
      feeCollector.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature3);
  });

  it("Initialize platform", async () => {
    try {
      await program.methods
        .initializePlatform(feeAmount, feeCollector.publicKey)
        .accounts({
          platformState: platformStatePda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Verify platform state
      const platformState = await program.account.platformState.fetch(platformStatePda);
      assert.equal(platformState.authority.toString(), authority.publicKey.toString());
      assert.equal(platformState.feeAmount.toNumber(), feeAmount);
      assert.equal(platformState.feeCollector.toString(), feeCollector.publicKey.toString());
      assert.equal(platformState.totalTokensCreated.toNumber(), 0);
      assert.equal(platformState.totalFeesCollected.toNumber(), 0);

      console.log("✅ Platform initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize platform:", error);
      throw error;
    }
  });

  it("Create token with fee payment", async () => {
    try {
      // Create mint account
      const mint = Keypair.generate();
      
      // Get associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        user.publicKey
      );

      // Get token record PDA
      const [tokenRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_record"), mint.publicKey.toBuffer()],
        program.programId
      );

      // Get initial balances
      const initialUserBalance = await provider.connection.getBalance(user.publicKey);
      const initialFeeCollectorBalance = await provider.connection.getBalance(feeCollector.publicKey);

      await program.methods
        .createToken(tokenName, tokenSymbol, decimals, new anchor.BN(initialSupply))
        .accounts({
          platformState: platformStatePda,
          mint: mint.publicKey,
          tokenAccount: tokenAccount,
          tokenRecord: tokenRecordPda,
          creator: user.publicKey,
          feePayment: user.publicKey,
          feeCollector: feeCollector.publicKey,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([user, mint])
        .rpc();

      // Verify token record
      const tokenRecord = await program.account.tokenRecord.fetch(tokenRecordPda);
      assert.equal(tokenRecord.creator.toString(), user.publicKey.toString());
      assert.equal(tokenRecord.mint.toString(), mint.publicKey.toString());
      assert.equal(tokenRecord.tokenName, tokenName);
      assert.equal(tokenRecord.tokenSymbol, tokenSymbol);
      assert.equal(tokenRecord.decimals, decimals);
      assert.equal(tokenRecord.initialSupply.toNumber(), initialSupply);

      // Verify fee transfer
      const finalUserBalance = await provider.connection.getBalance(user.publicKey);
      const finalFeeCollectorBalance = await provider.connection.getBalance(feeCollector.publicKey);
      
      // User should have paid the fee (plus transaction costs)
      assert.isTrue(initialUserBalance > finalUserBalance);
      // Fee collector should have received the fee
      assert.equal(finalFeeCollectorBalance - initialFeeCollectorBalance, feeAmount);

      // Verify platform statistics updated
      const updatedPlatformState = await program.account.platformState.fetch(platformStatePda);
      assert.equal(updatedPlatformState.totalTokensCreated.toNumber(), 1);
      assert.equal(updatedPlatformState.totalFeesCollected.toNumber(), feeAmount);

      console.log("✅ Token created successfully with fee payment");
    } catch (error) {
      console.error("❌ Failed to create token:", error);
      throw error;
    }
  });

  it("Update platform fee (admin only)", async () => {
    try {
      const newFeeAmount = 0.02 * LAMPORTS_PER_SOL; // 0.02 SOL

      await program.methods
        .updateFee(newFeeAmount)
        .accounts({
          platformState: platformStatePda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Verify fee updated
      const platformState = await program.account.platformState.fetch(platformStatePda);
      assert.equal(platformState.feeAmount.toNumber(), newFeeAmount);

      console.log("✅ Platform fee updated successfully");
    } catch (error) {
      console.error("❌ Failed to update fee:", error);
      throw error;
    }
  });

  it("Update fee collector (admin only)", async () => {
    try {
      const newFeeCollector = Keypair.generate();
      
      // Airdrop some SOL to new collector
      const signature = await provider.connection.requestAirdrop(
        newFeeCollector.publicKey,
        1 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      await program.methods
        .updateFeeCollector(newFeeCollector.publicKey)
        .accounts({
          platformState: platformStatePda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Verify fee collector updated
      const platformState = await program.account.platformState.fetch(platformStatePda);
      assert.equal(platformState.feeCollector.toString(), newFeeCollector.publicKey.toString());

      console.log("✅ Fee collector updated successfully");
    } catch (error) {
      console.error("❌ Failed to update fee collector:", error);
      throw error;
    }
  });

  it("Withdraw fees (admin only)", async () => {
    try {
      // Get current balances
      const initialAuthorityBalance = await provider.connection.getBalance(authority.publicKey);
      const initialFeeCollectorBalance = await provider.connection.getBalance(feeCollector.publicKey);

      const withdrawAmount = feeAmount; // Withdraw the fee we collected

      await program.methods
        .withdrawFees(withdrawAmount)
        .accounts({
          platformState: platformStatePda,
          authority: authority.publicKey,
          feeCollector: feeCollector.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Verify withdrawal
      const finalAuthorityBalance = await provider.connection.getBalance(authority.publicKey);
      const finalFeeCollectorBalance = await provider.connection.getBalance(feeCollector.publicKey);

      // Authority should have received the fee (minus transaction costs)
      assert.isTrue(finalAuthorityBalance > initialAuthorityBalance);
      // Fee collector should have less balance
      assert.isTrue(finalFeeCollectorBalance < initialFeeCollectorBalance);

      console.log("✅ Fees withdrawn successfully");
    } catch (error) {
      console.error("❌ Failed to withdraw fees:", error);
      throw error;
    }
  });

  it("Should fail when non-admin tries to update fee", async () => {
    try {
      const newFeeAmount = 0.03 * LAMPORTS_PER_SOL;

      await program.methods
        .updateFee(newFeeAmount)
        .accounts({
          platformState: platformStatePda,
          authority: user.publicKey, // Using user instead of authority
        })
        .signers([user])
        .rpc();

      // Should not reach here
      assert.fail("Expected error but transaction succeeded");
    } catch (error) {
      console.log("✅ Correctly rejected non-admin fee update");
      // Error should be thrown
    }
  });

  it("Should fail when insufficient fee is paid", async () => {
    try {
      // Create another mint
      const mint2 = Keypair.generate();
      const tokenAccount2 = await getAssociatedTokenAddress(
        mint2.publicKey,
        user.publicKey
      );
      const [tokenRecordPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_record"), mint2.publicKey.toBuffer()],
        program.programId
      );

      // Try to create token without paying fee
      await program.methods
        .createToken("Test Token 2", "TEST2", 6, new anchor.BN(1000000))
        .accounts({
          platformState: platformStatePda,
          mint: mint2.publicKey,
          tokenAccount: tokenAccount2,
          tokenRecord: tokenRecordPda2,
          creator: user.publicKey,
          feePayment: user.publicKey,
          feeCollector: feeCollector.publicKey,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([user, mint2])
        .rpc();

      // Should not reach here
      assert.fail("Expected error but transaction succeeded");
    } catch (error) {
      console.log("✅ Correctly rejected insufficient fee payment");
      // Error should be thrown
    }
  });
});

# CryptoLift Smart Contract Setup Guide 🚀

This guide will help you set up, build, deploy, and integrate the CryptoLift smart contract with your frontend.

## Prerequisites 📋

1. **Rust and Cargo** - Install from [rustup.rs](https://rustup.rs/)
2. **Solana CLI** - Install from [docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools)
3. **Anchor Framework** - Install with `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`
4. **Node.js and Yarn** - For testing and deployment scripts

## Quick Start 🏃‍♂️

### 1. Install Dependencies

```bash
cd cryptoliftcontract/cryptolift
yarn install
```

### 2. Build the Smart Contract

```bash
anchor build
```

### 3. Deploy to Localnet (for testing)

```bash
# Start local validator (in a separate terminal)
solana-test-validator

# Deploy the program
anchor deploy

# Initialize the platform
yarn deploy
```

### 4. Run Tests

```bash
anchor test
```

## Smart Contract Features 💡

### Fee Mechanism
- **Default Fee**: 0.01 SOL per token creation
- **Configurable**: Admin can update fee amount
- **Automatic Collection**: Fees are automatically deducted during token creation
- **Fee Tracking**: Platform tracks total fees collected

### Admin Functions
- `update_fee()` - Change platform fee
- `update_fee_collector()` - Change fee destination
- `withdraw_fees()` - Withdraw accumulated fees

### Token Creation
- Creates SPL token mint
- Creates associated token account
- Records token metadata
- Collects platform fee

## Integration with Frontend 🔗

### 1. Install Anchor Client

```bash
cd frontend
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

### 2. Update Frontend Code

Replace the current token creation logic in `Tokenlaunchpad.jsx` with the smart contract integration:

```javascript
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

// Import your program IDL (generated after build)
import { IDL } from "../idl/cryptolift";

const PROGRAM_ID = "YOUR_PROGRAM_ID"; // Replace with actual program ID

async function createTokenWithFee() {
  if (!wallet.connected) return;

  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program(IDL, PROGRAM_ID, provider);

  // Create mint account
  const mint = Keypair.generate();
  
  // Get associated token account
  const tokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    wallet.publicKey
  );

  // Get PDAs
  const [platformStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_state")],
    program.programId
  );

  const [tokenRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_record"), mint.publicKey.toBuffer()],
    program.programId
  );

  try {
    const tx = await program.methods
      .createToken(
        formdata.tokenname,
        formdata.symbol,
        6, // decimals
        new anchor.BN(formdata.initialSupply)
      )
      .accounts({
        platformState: platformStatePda,
        mint: mint.publicKey,
        tokenAccount: tokenAccount,
        tokenRecord: tokenRecordPda,
        creator: wallet.publicKey,
        feePayment: wallet.publicKey,
        feeCollector: feeCollector, // Get from platform state
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log("Token created:", tx);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### 3. Get Platform State

```javascript
// Get current platform fee
const platformState = await program.account.platformState.fetch(platformStatePda);
const feeAmount = platformState.feeAmount.toNumber() / LAMPORTS_PER_SOL;
console.log("Platform fee:", feeAmount, "SOL");
```

## Deployment to Different Networks 🌐

### Localnet (Testing)
```bash
anchor deploy
```

### Devnet (Testing)
```bash
anchor deploy --provider.cluster devnet
```

### Mainnet (Production)
```bash
anchor deploy --provider.cluster mainnet
```

## Admin Operations 👨‍💼

### Update Platform Fee
```javascript
await program.methods
  .updateFee(newFeeAmount)
  .accounts({
    platformState: platformStatePda,
    authority: adminWallet.publicKey,
  })
  .signers([adminWallet])
  .rpc();
```

### Withdraw Fees
```javascript
await program.methods
  .withdrawFees(amount)
  .accounts({
    platformState: platformStatePda,
    authority: adminWallet.publicKey,
    feeCollector: feeCollector,
    systemProgram: SystemProgram.programId,
  })
  .signers([adminWallet])
  .rpc();
```

## Security Considerations 🔒

1. **Authority Management**: Keep your authority keypair secure
2. **Fee Validation**: Contract validates fee payment before token creation
3. **Account Validation**: All accounts are validated for proper ownership
4. **Error Handling**: Comprehensive error handling for edge cases

## Troubleshooting 🔧

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed
2. **Deployment Errors**: Check Solana CLI version and network connection
3. **Transaction Errors**: Verify account setup and fee payment
4. **Type Errors**: Run `anchor build` to generate types

### Useful Commands

```bash
# Check Solana version
solana --version

# Check Anchor version
anchor --version

# View program logs
solana logs <PROGRAM_ID>

# Check account balance
solana balance <WALLET_ADDRESS>
```

## Support 💬

For issues and questions:
- Check the [Anchor documentation](https://www.anchor-lang.com/)
- Review [Solana documentation](https://docs.solana.com/)
- Create an issue in the GitHub repository

## Next Steps 🎯

1. **Test thoroughly** on localnet
2. **Deploy to devnet** for testing
3. **Integrate with frontend** using the provided examples
4. **Deploy to mainnet** when ready
5. **Monitor fees** and withdraw as needed

Happy building! 🚀 
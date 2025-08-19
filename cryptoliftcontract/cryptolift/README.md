# CryptoLift Smart Contract 🚀

A Solana-based smart contract for token creation with integrated fee collection mechanism. This contract allows users to create tokens while automatically collecting fees for the platform owner.

## Features 🔥

- **Token Creation**: Create new SPL tokens with custom parameters
- **Fee Collection**: Automatic fee collection for each token creation
- **Platform Management**: Admin functions to manage fees and collect revenue
- **Token Records**: Permanent record of all created tokens
- **Security**: Role-based access control for admin functions

## Smart Contract Functions 📋

### Core Functions

1. **`initialize_platform`** - Initialize the platform with fee settings
   - Sets the platform authority
   - Configures fee amount in lamports
   - Sets fee collector address

2. **`create_token`** - Create a new token with fee payment
   - Creates SPL token mint
   - Creates associated token account
   - Collects platform fee
   - Records token metadata

3. **`update_fee`** - Update platform fee (admin only)
   - Changes the fee amount for future token creations

4. **`update_fee_collector`** - Update fee collector address (admin only)
   - Changes where fees are sent

5. **`withdraw_fees`** - Withdraw collected fees (admin only)
   - Allows platform owner to withdraw accumulated fees

## Fee Mechanism 💰

- **Fee Amount**: Configurable fee in lamports (default: 0.01 SOL = 10,000,000 lamports)
- **Fee Collection**: Automatically deducted during token creation
- **Fee Destination**: Sent to designated fee collector address
- **Fee Tracking**: Platform keeps track of total fees collected

## Account Structures 🏗️

### PlatformState
```rust
pub struct PlatformState {
    pub authority: Pubkey,           // Platform admin
    pub fee_amount: u64,            // Fee in lamports
    pub fee_collector: Pubkey,      // Fee destination
    pub total_tokens_created: u64,  // Statistics
    pub total_fees_collected: u64,  // Statistics
}
```

### TokenRecord
```rust
pub struct TokenRecord {
    pub creator: Pubkey,            // Token creator
    pub mint: Pubkey,              // Token mint address
    pub token_name: String,        // Token name
    pub token_symbol: String,      // Token symbol
    pub decimals: u8,              // Token decimals
    pub initial_supply: u64,       // Initial supply
    pub created_at: i64,           // Creation timestamp
}
```

## Installation & Setup 🚀

### Prerequisites
- Rust and Cargo
- Solana CLI
- Anchor Framework

### Build the Contract
```bash
# Navigate to the contract directory
cd cryptoliftcontract/cryptolift

# Build the program
anchor build

# Deploy to localnet (for testing)
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

### Initialize Platform
```bash
# After deployment, initialize the platform
# This sets up the fee mechanism and admin controls
```

## Integration with Frontend 🔗

The smart contract integrates with the existing React frontend:

1. **Fee Payment**: Frontend must include fee payment in token creation transaction
2. **Account Setup**: Frontend needs to create all required accounts
3. **Transaction Building**: Use Anchor client to build and send transactions

### Example Frontend Integration
```javascript
// Create token with fee payment
const createTokenWithFee = async (
  tokenName,
  tokenSymbol,
  decimals,
  initialSupply
) => {
  // Build transaction with fee payment
  const tx = await program.methods
    .createToken(tokenName, tokenSymbol, decimals, initialSupply)
    .accounts({
      // ... account setup
    })
    .rpc();
};
```

## Security Considerations 🔒

- **Authority Control**: Only platform authority can update fees and withdraw
- **Fee Validation**: Contract validates fee payment before token creation
- **Account Validation**: All accounts are validated for proper ownership
- **Error Handling**: Comprehensive error handling for edge cases

## Error Codes 🚨

- `InsufficientFee`: User didn't pay enough fee
- `Unauthorized`: Non-admin trying to call admin function
- `InsufficientFunds`: Not enough funds for withdrawal

## Testing 🧪

```bash
# Run tests
anchor test

# Run specific test
anchor test --skip-local-validator
```

## License 📄

This project is licensed under the MIT License.

## Support 💬

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/saurabhhh777/CryptoLift/issues)
- Email: saurabhhere@gmail.com
- Twitter: [@saurabhhh777](https://twitter.com/saurabhhh777) 
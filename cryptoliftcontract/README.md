# CryptoLift Smart Contract 🚀

This folder contains the complete smart contract implementation for the CryptoLift token creation platform with integrated fee collection mechanism.

## What's Included 📦

### Smart Contract (`cryptolift/`)
- **Complete Anchor Program**: Full smart contract implementation in Rust
- **Fee Collection System**: Automatic fee deduction during token creation
- **Admin Controls**: Platform management functions
- **Token Records**: Permanent storage of all created tokens
- **Comprehensive Testing**: Full test suite covering all functionality

### Key Features 🔥

#### 1. **Token Creation with Fee Payment**
- Users can create SPL tokens with custom parameters
- Automatic fee collection (default: 0.01 SOL)
- Creates mint account and associated token account
- Records token metadata permanently

#### 2. **Platform Management**
- **Fee Management**: Admin can update platform fees
- **Fee Collection**: Admin can withdraw accumulated fees
- **Statistics Tracking**: Platform tracks total tokens and fees

#### 3. **Security Features**
- Role-based access control for admin functions
- Fee validation before token creation
- Account ownership verification
- Comprehensive error handling

## Smart Contract Functions 📋

### Core Functions
1. `initialize_platform()` - Initialize platform with fee settings
2. `create_token()` - Create token with automatic fee collection
3. `update_fee()` - Update platform fee (admin only)
4. `update_fee_collector()` - Update fee destination (admin only)
5. `withdraw_fees()` - Withdraw collected fees (admin only)

### Account Structures
- **PlatformState**: Stores platform configuration and statistics
- **TokenRecord**: Stores metadata for each created token

## Fee Mechanism 💰

- **Default Fee**: 0.01 SOL per token creation
- **Automatic Collection**: Fees deducted during token creation
- **Configurable**: Admin can change fee amount
- **Tracked**: Platform maintains statistics of all fees collected

## Quick Start 🏃‍♂️

1. **Navigate to the contract directory**:
   ```bash
   cd cryptoliftcontract/cryptolift
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Build the contract**:
   ```bash
   anchor build
   ```

4. **Deploy and initialize**:
   ```bash
   anchor deploy
   yarn deploy
   ```

5. **Run tests**:
   ```bash
   anchor test
   ```

## Integration with Frontend 🔗

The smart contract is designed to integrate seamlessly with your existing React frontend:

1. **Install Anchor client** in your frontend
2. **Update token creation logic** to use the smart contract
3. **Handle fee payments** automatically
4. **Display platform statistics** to users

See `cryptolift/SETUP.md` for detailed integration instructions.

## File Structure 📁

```
cryptoliftcontract/
├── cryptolift/
│   ├── programs/cryptolift/src/lib.rs    # Main smart contract
│   ├── tests/cryptolift.ts               # Comprehensive tests
│   ├── scripts/deploy.ts                 # Deployment script
│   ├── client-example.ts                 # Client integration example
│   ├── README.md                         # Smart contract documentation
│   ├── SETUP.md                          # Setup and integration guide
│   ├── Anchor.toml                       # Anchor configuration
│   └── Cargo.toml                        # Rust dependencies
└── README.md                             # This file
```

## Benefits for Your Platform 🎯

### For Users
- **Transparent Fees**: Clear fee structure
- **Reliable Creation**: Smart contract ensures proper token creation
- **Permanent Records**: All tokens are permanently recorded

### For Platform Owner
- **Automatic Revenue**: Fees collected automatically
- **Configurable Pricing**: Adjust fees as needed
- **Secure Management**: Admin-only access to sensitive functions
- **Transparent Tracking**: All fees and tokens tracked on-chain

## Security Considerations 🔒

- **Authority Control**: Only platform authority can update fees
- **Fee Validation**: Contract validates payment before creation
- **Account Security**: All accounts validated for proper ownership
- **Error Handling**: Comprehensive error handling for edge cases

## Next Steps 🚀

1. **Test the contract** thoroughly on localnet
2. **Deploy to devnet** for testing
3. **Integrate with your frontend** using the provided examples
4. **Deploy to mainnet** when ready
5. **Monitor and manage** your platform fees

## Support 💬

For questions and support:
- Check the detailed documentation in `cryptolift/README.md`
- Review the setup guide in `cryptolift/SETUP.md`
- Test the contract using the provided test suite
- Contact: saurabhhere@gmail.com

---

**Congratulations!** 🎉 You now have a complete smart contract that will automatically collect fees from users who create tokens through your platform. The contract is secure, well-tested, and ready for integration with your frontend. 
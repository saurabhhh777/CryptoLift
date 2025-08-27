# CryptoLift 🚀

A decentralized token launchpad built on Solana blockchain that allows users to create and launch their own tokens with ease.

## 🌟 Features

- **Token Creation**: Create custom SPL tokens with configurable supply and metadata
- **Fee Collection**: Automated fee collection system for platform sustainability
- **User-Friendly Interface**: Modern React frontend with intuitive token creation flow
- **Solana Integration**: Built on Solana blockchain for fast, low-cost transactions
- **Smart Contract Security**: Anchor framework for secure, auditable smart contracts

## 🏗️ Architecture

### Smart Contract (Anchor Program)
- **Location**: `cryptoliftcontract/cryptolift/programs/cryptolift/`
- **Language**: Rust with Anchor framework
- **Key Functions**:
  - `initialize_platform`: Sets up the platform with fee collector and configuration
  - `create_token`: Creates new SPL tokens with metadata and fee collection

### Frontend Application
- **Location**: `frontend/`
- **Framework**: React with Vite
- **Key Features**:
  - Wallet connection and management
  - Token creation interface
  - Transaction simulation and execution
  - Real-time error handling and logging

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Rust toolchain
- Solana CLI tools
- Anchor CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saurabhhh777/CryptoLift.git
   cd cryptolift
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install smart contract dependencies
   cd ../cryptoliftcontract/cryptolift
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in frontend directory
   cd ../../frontend
   cp .env.example .env
   
   # Add your Solana devnet RPC key
   echo "SOLANA_DEVNET_KEY=your_rpc_key_here" >> .env
   ```

4. **Build and Deploy Smart Contract**
   ```bash
   cd ../cryptoliftcontract/cryptolift
   anchor build
   anchor deploy --provider.cluster devnet
   ```

5. **Start Frontend**
   ```bash
   cd ../../frontend
   npm run dev
   ```

## 📁 Project Structure

```
cryptolift/
├── cryptoliftcontract/          # Smart contract (Anchor program)
│   └── cryptolift/
│       ├── programs/
│       │   └── cryptolift/      # Main program logic
│       ├── scripts/             # Deployment and test scripts
│       └── tests/               # Program tests
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   └── utils/               # Utility functions
│   └── public/                  # Static assets
└── docs/                        # Documentation
```

## 🔧 Configuration

### Smart Contract Configuration
- **Program ID**: `HHBLrTyLRaSLhVUhJw75MMi1d4heggk6SWB77fJdouKT`
- **Platform Fee**: Configurable fee amount for token creation
- **Fee Collector**: Platform wallet for fee collection

### Frontend Configuration
- **Network**: Solana Devnet (configurable)
- **RPC Endpoint**: Custom RPC for better performance
- **Wallet Integration**: Phantom, Solflare, and other Solana wallets

## 🧪 Testing

### Smart Contract Tests
```bash
cd cryptoliftcontract/cryptolift
anchor test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
```bash
# Test deployed program
cd cryptoliftcontract/cryptolift
node scripts/test-deployed-program.js
```

## 🐛 Known Issues & Solutions

### Current Issues
1. **ExternalAccountLamportSpend Error**: The deployed smart contract has a design flaw in fee collection logic
   - **Status**: Frontend workaround implemented, but requires smart contract redeployment
   - **Solution**: Redeploy with CPI-based fee transfer logic

2. **Rust Toolchain Issues**: Build failures with newer Rust versions
   - **Status**: Investigating compatibility issues
   - **Workaround**: Use specific Rust toolchain versions

### Error Codes
- **3015**: AccountSysvarMismatch - Fixed with correct sysvar addresses
- **3011**: AccountNotSystemOwned - Fixed with proper account structure
- **ExternalAccountLamportSpend**: Smart contract design issue - Requires redeployment

## 🔒 Security

- **Smart Contract**: Built with Anchor framework for security best practices
- **Frontend**: Input validation and transaction simulation
- **Fee Collection**: Secure fee transfer mechanisms
- **Wallet Integration**: Standard Solana wallet adapter patterns

## 📈 Roadmap

- [ ] Fix smart contract fee collection logic
- [ ] Add token management features
- [ ] Implement token vesting schedules
- [ ] Add liquidity pool integration
- [ ] Multi-chain support
- [ ] Advanced tokenomics features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/saurabhhh777/CryptoLift/issues)
- **Documentation**: Check the `docs/` folder for detailed guides
- **Discord**: Join our community for real-time support

## 🙏 Acknowledgments

- Solana Labs for the blockchain infrastructure
- Anchor team for the development framework
- SPL Token program for token standards
- React and Vite communities for frontend tooling

---

**Built with ❤️ on Solana**
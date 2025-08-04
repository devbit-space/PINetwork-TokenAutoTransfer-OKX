# Wallet Manager

A modern React application for managing Ethereum wallet connections and ETH transactions across multiple networks (Mainnet, Sepolia, and Goerli testnets) using the OKX Wallet browser extension.

## 🌟 Features

### Wallet Connection Page
- **Multi-Network Support**: Connect to Ethereum Mainnet, Sepolia, and Goerli testnets
- **OKX Wallet Integration**: Seamless connection with OKX Wallet browser extension
- **Auto-Reconnection**: Automatically reconnects to previously connected wallets
- **Network Switching**: Easy switching between different Ethereum networks
- **Real-time Balance**: Live ETH balance updates
- **Transaction Monitoring**: Real-time transaction status tracking

### Wallet Status Page
- **Address Lookup**: Check wallet status for any Ethereum address
- **Balance Display**: View ETH balance for any wallet
- **Transaction History**: View recent transactions
- **Network Support**: Works across all supported networks

### ETH Withdrawal System
- **Custom Amounts**: Specify exact ETH amounts to withdraw
- **Target Address**: Send ETH to any wallet address
- **Transaction Confirmation**: Real-time transaction monitoring
- **Network-Aware**: Works on all supported networks
- **Gas Estimation**: Automatic gas estimation for transactions

## 🚀 Prerequisites

- Node.js (v16 or higher)
- OKX Wallet browser extension installed
- Infura account (for RPC endpoints)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd my-vite-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Ethereum Network Configuration
   VITE_INFURA_PROJECT_ID=your-infura-project-id-here
   VITE_TARGET_WALLET_ADDRESS=0x...your-target-wallet
   VITE_DEFAULT_NETWORK=mainnet
   
   # App Configuration
   VITE_APP_NAME=Wallet Manager
   VITE_APP_VERSION=1.0.0
   
   # Transaction Settings
   VITE_MAX_TRANSACTION_TIMEOUT=120
   VITE_TRANSACTION_CHECK_INTERVAL=2000
   
   # Feature Flags
   VITE_ENABLE_AUTO_RECONNECT=true
   VITE_ENABLE_TRANSACTION_MONITORING=true
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_INFURA_PROJECT_ID` | Your Infura project ID | - | Yes |
| `VITE_TARGET_WALLET_ADDRESS` | Default target wallet for withdrawals | `0xffb5a95e5ff7ffc61813bba9171d026c64b09059` | No |
| `VITE_DEFAULT_NETWORK` | Default network (mainnet/sepolia/goerli) | `mainnet` | No |
| `VITE_APP_NAME` | Application name | `Wallet Manager` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |
| `VITE_MAX_TRANSACTION_TIMEOUT` | Transaction monitoring timeout (seconds) | `120` | No |
| `VITE_TRANSACTION_CHECK_INTERVAL` | Transaction check interval (ms) | `2000` | No |
| `VITE_ENABLE_AUTO_RECONNECT` | Enable auto-reconnection | `true` | No |
| `VITE_ENABLE_TRANSACTION_MONITORING` | Enable transaction monitoring | `true` | No |

### Network Configuration

The application supports three Ethereum networks:

- **🌐 Ethereum Mainnet** (Chain ID: 1) - Production network
- **🧪 Sepolia Testnet** (Chain ID: 11155111) - Modern testnet
- **🔬 Goerli Testnet** (Chain ID: 5) - Legacy testnet

## 📖 Usage

### Wallet Connection

1. **Install OKX Wallet**: Download and install the OKX Wallet browser extension
2. **Select Network**: Choose your preferred network (Mainnet/Testnet)
3. **Connect Wallet**: Click "Connect OKX Wallet" and approve the connection
4. **View Balance**: See your ETH balance and wallet information
5. **Withdraw ETH**: Use the "Withdraw ETH" button to send ETH to any address

### Wallet Status

1. **Navigate to Status Page**: Click "Wallet Status" in the navigation
2. **Enter Address**: Input any Ethereum wallet address
3. **Check Status**: View balance and transaction history
4. **Copy Information**: Copy transaction hashes and addresses

## 🏗️ Project Structure

```
src/
├── components/
│   ├── WalletConnection.tsx    # Main wallet connection component
│   ├── WalletStatus.tsx        # Wallet status lookup component
│   ├── NetworkSelector.tsx     # Network selection component
│   └── ConfigValidator.tsx     # Environment configuration validator
├── services/
│   └── okxWalletService.ts     # OKX wallet integration service
├── config/
│   └── environment.ts          # Environment configuration management
├── types/
│   └── okxwallet.d.ts         # OKX wallet type definitions
└── App.tsx                    # Main application component
```

## 🛠️ Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and development server
- **Ethers.js** - Ethereum library for blockchain interaction
- **React Router** - Client-side routing
- **OKX Wallet** - Browser wallet integration

## 🔒 Security Notes

- **Private Keys**: Never share your private keys or seed phrases
- **Environment Variables**: Keep your `.env` file secure and never commit it to version control
- **Network Selection**: Always verify you're on the correct network before making transactions
- **Address Verification**: Double-check wallet addresses before sending transactions

## 🚨 Troubleshooting

### Common Issues

1. **OKX Wallet Not Detected**
   - Ensure OKX Wallet extension is installed and enabled
   - Refresh the page after installing the extension

2. **Transaction Timeout**
   - Check your internet connection
   - Verify the network is not congested
   - Use the "Refresh Status" button to manually check

3. **Configuration Errors**
   - Ensure all required environment variables are set
   - Check the configuration validator for specific issues
   - Restart the development server after changing environment variables

4. **Network Switching Issues**
   - Make sure the network is added to your OKX Wallet
   - Try refreshing the page after switching networks

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

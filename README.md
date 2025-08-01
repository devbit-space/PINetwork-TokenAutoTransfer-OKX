# Pi Coin Auto-Withdrawal App

A modern React application for automatically withdrawing Pi coins from OKX Wallet with a beautiful, professional UI.

## Features

### 🏠 Wallet Connection Page
- **OKX Wallet Integration**: Seamless connection to OKX Wallet browser extension
- **Auto-Reconnection**: Automatically reconnects to previously connected wallets
- **Pi Coin Withdrawal**: Automatically withdraws all Pi coins to a target wallet
- **Transaction Monitoring**: Real-time transaction status tracking
- **Settings Management**: Configure target wallet address for withdrawals

### 📊 Wallet Status Page (NEW!)
- **Wallet Lookup**: Check any wallet address for balances and status
- **Balance Display**: View ETH and Pi coin balances
- **Transaction History**: See recent transaction activity
- **Connection Status**: Check if wallet is currently connected
- **Copy to Clipboard**: Easy copying of addresses and transaction hashes
- **Toast Notifications**: User-friendly feedback for all actions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- OKX Wallet browser extension installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-vite-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Wallet Connection
1. Navigate to the "Wallet Connection" page
2. Install OKX Wallet browser extension if not already installed
3. Click "Connect OKX Wallet" and approve the connection
4. Pi coins will be automatically withdrawn to the configured target wallet
5. Monitor transaction status in real-time

### Wallet Status Lookup
1. Navigate to the "Wallet Status" page
2. Enter any wallet address to check its status
3. View balances, connection status, and recent transactions
4. Use the "Check Current Wallet" button if you're connected to OKX Wallet
5. Copy addresses and transaction hashes with one click

## Project Structure

```
src/
├── components/
│   ├── WalletConnection.tsx    # Main wallet connection functionality
│   └── WalletStatus.tsx        # Wallet status lookup component
├── services/
│   ├── okxApi.ts              # OKX API integration
│   └── okxWalletService.ts    # Wallet service logic
├── types/
│   └── okxwallet.d.ts         # TypeScript declarations
├── App.tsx                    # Main app with routing
└── main.tsx                   # App entry point
```

## Technologies Used

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Ethers.js** - Ethereum library for wallet interaction
- **OKX Wallet** - Browser extension for wallet management

## Features in Detail

### Auto-Withdrawal System
- Automatically detects Pi coin balances
- Withdraws all available Pi coins to target wallet
- Handles transaction fees from ETH balance
- Real-time transaction confirmation monitoring

### Wallet Status System
- Query any wallet address for balances
- View recent transaction history
- Check connection status
- Copy addresses and transaction hashes
- Toast notifications for user feedback

### Modern UI/UX
- Glass morphism design with blur effects
- Responsive design for all screen sizes
- Smooth animations and transitions
- Professional color scheme and typography
- Accessibility features

## Configuration

### Target Wallet Address
Set your target wallet address in the settings panel on the Wallet Connection page. This is where all Pi coins will be withdrawn.

### Network Configuration
The app is configured for Pi Network mainnet. Update the RPC URL and contract addresses in `src/services/okxWalletService.ts` if needed.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new routes in `src/App.tsx`
3. Update services in `src/services/` for new functionality
4. Add TypeScript types as needed

## Security Notes

- Never share your private keys
- Always verify target wallet addresses
- The withdrawal process is irreversible
- Keep your OKX Wallet extension secure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

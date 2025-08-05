import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import okxWalletService from '../services/okxWalletService';
import type { WalletInfo } from '../services/okxWalletService';

interface WalletStatusProps {
  walletAddress?: string;
}

interface WalletStatusData {
  address: string;
  ethBalance: string;
  isConnected: boolean;
  lastTransaction?: {
    hash: string;
    timestamp: number;
    type: 'withdrawal' | 'deposit';
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function WalletStatus({ walletAddress }: WalletStatusProps) {
  const [statusData, setStatusData] = useState<WalletStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputAddress, setInputAddress] = useState(walletAddress || '');
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Check if wallet is connected
    const checkConnection = async () => {
      const connected = okxWalletService.isWalletConnected();
      setIsConnected(connected);
      
      if (connected && !walletAddress) {
        // If connected and no specific address provided, check current wallet
        await checkWalletStatus();
      }
    };

    checkConnection();
  }, [walletAddress]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const checkWalletStatus = async (address?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const targetAddress = address || inputAddress;
      
      if (!targetAddress) {
        setError('Please enter a wallet address');
        return;
      }

      // Validate address format
      if (!ethers.isAddress(targetAddress)) {
        setError('Invalid wallet address format');
        return;
      }

      // Get ETH balance
      const provider = okxWalletService['provider'];
      if (!provider) {
        setError('Provider not available');
        return;
      }

      const ethBalance = await provider.getBalance(targetAddress);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);

      // Get transaction history (last few transactions)
      const lastTransaction = await getLastTransaction(targetAddress);

      setStatusData({
        address: targetAddress,
        ethBalance: ethBalanceFormatted,
        isConnected: isConnected,
        lastTransaction
      });

      addToast('Wallet status checked successfully!', 'success');

    } catch (err: any) {
      setError(`Error checking wallet status: ${err.message}`);
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLastTransaction = async (address: string) => {
    try {
      const provider = okxWalletService['provider'];
      if (!provider) return undefined;

      // Get the latest block number
      const latestBlock = await provider.getBlockNumber();
      
      // Look for recent transactions (last 10 blocks)
      for (let i = 0; i < 10; i++) {
        const blockNumber = latestBlock - i;
        const block = await provider.getBlock(blockNumber, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (typeof tx === 'string') continue;
            
            const txObj = tx as any; // Type assertion for transaction object
            if (txObj.from?.toLowerCase() === address.toLowerCase() || 
                txObj.to?.toLowerCase() === address.toLowerCase()) {
              return {
                hash: txObj.hash,
                timestamp: block.timestamp || 0,
                type: (txObj.from?.toLowerCase() === address.toLowerCase() ? 'withdrawal' : 'deposit') as 'withdrawal' | 'deposit'
              };
            }
          }
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting last transaction:', error);
      return undefined;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  return (
    <div className="wallet-status-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="status-header">
        <h2>Wallet Status Lookup</h2>
        <p>Check wallet balances and recent activity</p>
      </div>

      <div className="status-input-section">
        <div className="input-group">
          <label htmlFor="wallet-address">Wallet Address:</label>
          <input
            id="wallet-address"
            type="text"
            placeholder="0x..."
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            className="status-input"
          />
          <button 
            className="check-status-btn"
            onClick={() => checkWalletStatus()}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
        
        {isConnected && (
          <button 
            className="check-current-btn"
            onClick={() => checkWalletStatus()}
            disabled={loading}
          >
            Check Current Wallet
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {statusData && (
        <div className="status-results">
          <div className="wallet-info-card">
            <div className="wallet-header">
              <h3>Wallet Information</h3>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(statusData.address)}
              >
                📋 Copy Address
              </button>
            </div>
            
            <div className="address-display">
              <strong>Address:</strong>
              <code>{formatAddress(statusData.address)}</code>
            </div>

            <div className="balance-section">
              <div className="balance-card">
                <div className="balance-amount">{formatBalance(statusData.ethBalance)} ETH</div>
                <div className="balance-label">Ethereum Balance</div>
              </div>
            </div>

            <div className="connection-status">
              <strong>Connection Status:</strong>
              <span className={`status-indicator ${statusData.isConnected ? 'connected' : 'disconnected'}`}>
                {statusData.isConnected ? ' 🟢 Connected' : ' 🔴 Disconnected'}
              </span>
            </div>

            {statusData.lastTransaction && (
              <div className="last-transaction">
                <h4>Last Transaction</h4>
                <div className="transaction-info">
                  <div className="transaction-type">
                    <span className={`type-badge ${statusData.lastTransaction.type}`}>
                      {statusData.lastTransaction.type === 'withdrawal' ? '↗️ Outgoing' : '↙️ Incoming'}
                    </span>
                  </div>
                  <div className="transaction-hash">
                    <strong>Hash:</strong> {formatAddress(statusData.lastTransaction.hash)}
                    <button 
                      className="copy-hash-btn"
                      onClick={() => copyToClipboard(statusData.lastTransaction!.hash)}
                    >
                      📋
                    </button>
                  </div>
                  <div className="transaction-time">
                    <strong>Time:</strong> {new Date(statusData.lastTransaction.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="status-help">
        <h4>How to use:</h4>
        <ul>
          <li>Enter any wallet address to check its ETH balance and status</li>
          <li>If you're connected to OKX Wallet, you can check your current wallet</li>
          <li>View recent transaction history and connection status</li>
          <li>Copy addresses and transaction hashes to clipboard</li>
        </ul>
      </div>
    </div>
  );
}

export default WalletStatus; 
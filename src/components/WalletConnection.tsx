import { useState, useEffect } from 'react';
import okxWalletService from '../services/okxWalletService';
import type { WalletInfo, PiWithdrawalResult } from '../services/okxWalletService';
import { ethers } from 'ethers';
import NetworkSelector from './NetworkSelector';
import { config } from '../config/environment';

interface TransactionStatus {
  hash: string;
  confirmed: boolean;
  blockNumber?: number;
  gasUsed?: string;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string, targetAddress: string) => void;
  walletInfo: WalletInfo | null;
  loading: boolean;
}

function WithdrawalModal({ isOpen, onClose, onConfirm, walletInfo, loading }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!amount || !targetAddress) {
      setError('Please enter both amount and target address');
      return;
    }

    if (!ethers.isAddress(targetAddress)) {
      setError('Invalid target wallet address');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (walletInfo && numAmount > parseFloat(walletInfo.balance)) {
      setError('Insufficient ETH balance');
      return;
    }

    onConfirm(amount, targetAddress);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Confirm ETH Withdrawal</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="wallet-status-display">
            <h4>Connected Wallet</h4>
            <div className="wallet-details">
              <div className="wallet-address">
                <strong>Address:</strong> {walletInfo?.address.slice(0, 6)}...{walletInfo?.address.slice(-4)}
              </div>
              <div className="wallet-balance">
                <strong>ETH Balance:</strong> {walletInfo?.balance} ETH
              </div>
              <div className="wallet-network">
                <strong>Network:</strong> {walletInfo?.network}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="withdrawal-amount">Amount to Withdraw (ETH):</label>
            <input
              id="withdrawal-amount"
              type="number"
              step="0.001"
              min="0.001"
              max={walletInfo?.balance || 0}
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
            />
            <small>Available: {walletInfo?.balance} ETH</small>
          </div>

          <div className="form-group">
            <label htmlFor="target-address">Target Wallet Address:</label>
            <input
              id="target-address"
              type="text"
              placeholder="0x..."
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletConnection() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawalResult, setWithdrawalResult] = useState<PiWithdrawalResult | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(okxWalletService.getCurrentNetwork());

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const autoReconnect = async () => {
      // Check if auto-reconnect is enabled and wallet was previously connected
      if (config.ENABLE_AUTO_RECONNECT && okxWalletService.isWalletPreviouslyConnected()) {
        setIsReconnecting(true);
        setSuccess('🔄 Attempting to reconnect wallet...');
        
        try {
          // Try to reconnect if wallet was previously connected
          const reconnectedWallet = await okxWalletService.reconnectWallet();
          if (reconnectedWallet) {
            setWalletInfo(reconnectedWallet);
            setCurrentNetwork(okxWalletService.getCurrentNetwork());
            setSuccess('Wallet automatically reconnected!');
          } else {
            setSuccess('ℹ️ No active wallet connection found');
          }
        } catch (error) {
          console.error('Error during auto-reconnection:', error);
          // If auto-reconnection fails, clear any invalid state
          setWalletInfo(null);
          setError('❌ Failed to reconnect wallet automatically');
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    autoReconnect();

    // Listen for wallet account changes
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected the wallet
        await disconnectWallet();
      } else if (walletInfo && accounts[0] !== walletInfo.address) {
        // User switched accounts
        setSuccess('🔄 Wallet account changed, reconnecting...');
        try {
          const newWalletData = await okxWalletService.connectWallet();
          setWalletInfo(newWalletData);
          setCurrentNetwork(okxWalletService.getCurrentNetwork());
          setSuccess('Connected to new wallet account!');
        } catch (error) {
          console.error('Error connecting to new account:', error);
          setError('❌ Failed to connect to new account');
        }
      }
    };

    // Add event listener for account changes
    if (typeof window.okxwallet !== 'undefined') {
      window.okxwallet.on('accountsChanged', handleAccountsChanged);
    }

    // Cleanup function
    return () => {
      if (typeof window.okxwallet !== 'undefined') {
        window.okxwallet.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [walletInfo?.address]); // Add walletInfo.address as dependency

  const refreshWalletInfo = async () => {
    if (okxWalletService.isWalletConnected()) {
      try {
        const address = await okxWalletService['signer']?.getAddress();
        if (address) {
          const balance = await okxWalletService['provider']?.getBalance(address);
          const ethBalance = balance ? ethers.formatEther(balance) : '0';
          
          const networks = okxWalletService.getAvailableNetworks();
          const currentNetwork = okxWalletService.getCurrentNetwork();
          const networkInfo = networks[currentNetwork as keyof typeof networks];
          
          setWalletInfo({
            address,
            balance: ethBalance,
            piBalance: '0', // Not used for ETH
            network: networkInfo.name,
            isConnected: true,
            chainId: networkInfo.chainId
          });
        }
      } catch (error) {
        console.error('Error refreshing wallet info:', error);
      }
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setWithdrawalResult(null);
    setTransactionStatus(null);
    
    try {
      const walletData = await okxWalletService.connectWallet();
      setWalletInfo(walletData);
      setCurrentNetwork(okxWalletService.getCurrentNetwork());
      setSuccess('OKX Wallet connected successfully!');
    } catch (err: any) {
      setError(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await okxWalletService.disconnectWallet();
      setWalletInfo(null);
      setWithdrawalResult(null);
      setTransactionStatus(null);
      setError('');
      setSuccess('Wallet disconnected successfully');
      setShowWithdrawalModal(false);
    } catch (err: any) {
      setError(`❌ Error disconnecting wallet: ${err.message}`);
    }
  };

  const withdrawETH = async (amount: string, targetAddress: string) => {
    if (!walletInfo || parseFloat(amount) <= 0) {
      setError('❌ Invalid withdrawal amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('🔄 Processing ETH withdrawal...');
    setShowWithdrawalModal(false);
    
    try {
      const result = await okxWalletService.withdrawETH(amount, targetAddress);
      setWithdrawalResult(result);
      
      if (result.success) {
        setSuccess(`Successfully withdrew ${result.amount} ETH!`);
        setTransactionStatus({
          hash: result.transactionHash!,
          confirmed: false
        });
        
        // Monitor transaction status if enabled
        if (config.ENABLE_TRANSACTION_MONITORING) {
          monitorTransactionStatus(result.transactionHash!);
        }
        
        // Refresh wallet info to show updated balance
        setTimeout(refreshWalletInfo, 2000);
      } else {
        setError(`❌ Withdrawal failed: ${result.error}`);
      }
    } catch (err: any) {
      setError(`❌ Error during withdrawal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const monitorTransactionStatus = async (txHash: string) => {
    const txConfig = okxWalletService.getTransactionConfig();
    let attempts = 0;
    const maxAttempts = txConfig.maxTimeout;
    const checkInterval = txConfig.checkInterval;
    
    setSuccess('🔄 Transaction submitted! Monitoring for confirmation...');
    
    const checkStatus = async () => {
      try {
        const status = await okxWalletService.checkTransactionStatus(txHash);
        
        if (status.confirmed) {
          setTransactionStatus({
            hash: txHash,
            confirmed: true,
            blockNumber: status.blockNumber,
            gasUsed: status.gasUsed
          });
          setSuccess('✅ Transaction confirmed on blockchain!');
          
          // Refresh wallet info to show updated balance
          setTimeout(refreshWalletInfo, 1000);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Update status message with attempt count
          const remainingTime = Math.ceil((maxAttempts - attempts) * checkInterval / 1000);
          setSuccess(`⏳ Transaction pending... Checking confirmation (${remainingTime}s remaining)`);
          setTimeout(checkStatus, checkInterval);
        } else {
          setError('⚠️ Transaction status check timeout. Please verify manually on the blockchain explorer.');
          // Keep the transaction status visible so user can check manually
          setTransactionStatus({
            hash: txHash,
            confirmed: false
          });
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        attempts++;
        
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, checkInterval);
        } else {
          setError('⚠️ Unable to verify transaction status. Please check manually on the blockchain explorer.');
        }
      }
    };
    
    checkStatus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const handleNetworkChange = (networkName: string) => {
    setCurrentNetwork(networkName);
    // Refresh wallet info to update network display
    setTimeout(refreshWalletInfo, 1000);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>{config.APP_NAME}</h2>
          <div className="wallet-status">
            {typeof window.okxwallet !== 'undefined' ? (
              <div className="status-ok">
                OKX Wallet detected
                {okxWalletService.getPreviouslyConnectedAddress() && (
                  <div className="previous-address">
                    Previously connected: {okxWalletService.getPreviouslyConnectedAddress()?.slice(0, 6)}...{okxWalletService.getPreviouslyConnectedAddress()?.slice(-4)}
                  </div>
                )}
              </div>
            ) : (
              <div className="status-error">OKX Wallet not found. Please install the extension.</div>
            )}
          </div>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>
        </div>
        
        {showSettings && (
          <div className="settings-panel">
            <h3>Network Settings</h3>
            <NetworkSelector 
              currentNetwork={currentNetwork}
              onNetworkChange={handleNetworkChange}
            />
          </div>
        )}
        
        {!walletInfo?.isConnected ? (
          <div className="connection-section">
            {isReconnecting ? (
              <div className="reconnecting-section">
                <div className="loading-spinner"></div>
                <h3>Reconnecting Wallet...</h3>
                <p>Attempting to restore your previous wallet connection</p>
              </div>
            ) : (
              <>
                <div className="wallet-instructions">
                  <h3>Instructions</h3>
                  <ol>
                    <li>Install OKX Wallet browser extension</li>
                    <li>Select your preferred network (Mainnet/Testnet)</li>
                    <li>Make sure you have ETH in your wallet</li>
                    <li>Click "Connect Wallet" below</li>
                    <li>Approve the connection in OKX Wallet</li>
                    <li>Use the "Withdraw ETH" button to send ETH to any address</li>
                  </ol>
                </div>
                
                <button 
                  className={`connect-btn ${loading ? 'loading' : ''}`}
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Connecting...
                    </>
                  ) : (
                    '🔗 Connect OKX Wallet'
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="wallet-info">
            <div className="wallet-header">
              <h3>Connected Wallet</h3>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
            
            <div className="network-display">
              <span className="network-badge">
                {walletInfo.network}
              </span>
            </div>
            
            <div className="balance-cards">
              <div className="balance-card">
                <div className="balance-amount">{walletInfo.balance} ETH</div>
                <div className="balance-label">ETH Balance</div>
              </div>
            </div>
            
            <div className="address-display">
              <strong>Wallet Address:</strong>
              <code onClick={() => copyToClipboard(walletInfo.address)}>
                {walletInfo.address}
              </code>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(walletInfo.address)}
              >
                📋
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                className={`withdraw-btn ${loading ? 'loading' : ''}`}
                onClick={() => setShowWithdrawalModal(true)}
                disabled={loading}
              >
                💸 Withdraw ETH
              </button>
              
              <button 
                className="refresh-btn"
                onClick={refreshWalletInfo}
                disabled={loading}
              >
                🔄 Refresh Balance
              </button>
            </div>
            
            {withdrawalResult && (
              <div className={`withdrawal-result ${withdrawalResult.success ? 'success' : 'error'}`}>
                <h4>Withdrawal Result</h4>
                {withdrawalResult.success ? (
                  <div>
                    <p>✅ Successfully withdrew {withdrawalResult.amount} ETH</p>
                    <p>Transaction Hash: {withdrawalResult.transactionHash}</p>
                  </div>
                ) : (
                  <p>❌ {withdrawalResult.error}</p>
                )}
              </div>
            )}
            
            {transactionStatus && (
              <div className="transaction-status">
                <h4>Transaction Status</h4>
                <div className={`status ${transactionStatus.confirmed ? 'confirmed' : 'pending'}`}>
                  {transactionStatus.confirmed ? '✅ Confirmed' : '⏳ Pending'}
                </div>
                <p>Hash: {transactionStatus.hash}</p>
                {transactionStatus.blockNumber && (
                  <p>Block: {transactionStatus.blockNumber}</p>
                )}
                {transactionStatus.gasUsed && (
                  <p>Gas Used: {transactionStatus.gasUsed}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
      </div>
      
      <div className="info-card">
        <h3>Important Information</h3>
        <ul>
          <li>✅ This app allows you to withdraw ETH from your connected wallet</li>
          <li>✅ You can specify the exact amount and target wallet address</li>
          <li>✅ Transaction fees will be deducted from your ETH balance</li>
          <li>✅ The withdrawal process is irreversible once confirmed</li>
          <li>⚠️ Always verify the target address before confirming</li>
          <li>⚠️ Keep your private keys secure and never share them</li>
          <li>🌐 Support for Mainnet, Sepolia, and Goerli testnets</li>
          <li>⚙️ Version: {config.APP_VERSION}</li>
        </ul>
      </div>

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onConfirm={withdrawETH}
        walletInfo={walletInfo}
        loading={loading}
      />
    </>
  );
}

export default WalletConnection; 
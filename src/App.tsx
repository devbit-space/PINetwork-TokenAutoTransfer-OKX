import React, { useState, useEffect } from 'react';
import './App.css';
import okxWalletService from './services/okxWalletService';
import type { WalletInfo, PiWithdrawalResult } from './services/okxWalletService';
import { ethers } from 'ethers';

interface TransactionStatus {
  hash: string;
  confirmed: boolean;
  blockNumber?: number;
  gasUsed?: string;
}

function App() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawalResult, setWithdrawalResult] = useState<PiWithdrawalResult | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [targetWalletAddress, setTargetWalletAddress] = useState(okxWalletService.getTargetWalletAddress());
  const [showSettings, setShowSettings] = useState(false);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    if (okxWalletService.isWalletConnected()) {
      // Wallet is already connected, refresh wallet info
      refreshWalletInfo();
    }
  }, []);

  const refreshWalletInfo = async () => {
    if (okxWalletService.isWalletConnected()) {
      try {
        const address = await okxWalletService['signer']?.getAddress();
        if (address) {
          const balance = await okxWalletService['provider']?.getBalance(address);
          const ethBalance = balance ? ethers.formatEther(balance) : '0';
          const piBalance = await okxWalletService.getPiTokenBalance(address);
          
          setWalletInfo({
            address,
            balance: ethBalance,
            piBalance,
            network: 'Pi Network',
            isConnected: true
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
      setSuccess('✅ OKX Wallet connected successfully!');
      
      // Automatically withdraw Pi coins after connection
      if (parseFloat(walletData.piBalance) > 0) {
        setSuccess('✅ Wallet connected! Starting Pi coin withdrawal...');
        await withdrawPiCoins();
      } else {
        setSuccess('✅ Wallet connected! No Pi coins found for withdrawal.');
      }
    } catch (err: any) {
      setError(`❌ ${err.message}`);
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
      setSuccess('✅ Wallet disconnected successfully');
    } catch (err: any) {
      setError(`❌ Error disconnecting wallet: ${err.message}`);
    }
  };

  const withdrawPiCoins = async () => {
    if (!walletInfo || parseFloat(walletInfo.piBalance) <= 0) {
      setError('❌ No Pi coins available for withdrawal');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('🔄 Processing Pi coin withdrawal...');
    
    try {
      const result = await okxWalletService.withdrawAllPiCoins();
      setWithdrawalResult(result);
      
      if (result.success) {
        setSuccess(`✅ Successfully withdrew ${result.amount} Pi coins!`);
        setTransactionStatus({
          hash: result.transactionHash!,
          confirmed: false
        });
        
        // Monitor transaction status
        monitorTransactionStatus(result.transactionHash!);
        
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
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds
    
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
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000);
        } else {
          setError('⚠️ Transaction status check timeout. Please verify manually.');
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    };
    
    checkStatus();
  };

  const updateTargetWallet = () => {
    if (targetWalletAddress && /^0x[a-fA-F0-9]{40}$/.test(targetWalletAddress)) {
      okxWalletService.setTargetWalletAddress(targetWalletAddress);
      setSuccess('✅ Target wallet address updated successfully!');
      setShowSettings(false);
    } else {
      setError('❌ Invalid wallet address format');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('✅ Copied to clipboard!');
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🪙 Pi Coin Auto-Withdrawal</h1>
          <p>Connect your OKX wallet and automatically withdraw all Pi coins</p>
          <div className="header-decoration">
            <div className="decoration-dot"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-dot"></div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h2>OKX Wallet Connection</h2>
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙️ Settings
              </button>
            </div>
            
            {showSettings && (
              <div className="settings-panel">
                <h3>Withdrawal Settings</h3>
                <div className="form-group">
                  <label>Target Wallet Address:</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={targetWalletAddress}
                    onChange={(e) => setTargetWalletAddress(e.target.value)}
                    className="form-input"
                  />
                  <button 
                    className="update-btn"
                    onClick={updateTargetWallet}
                  >
                    Update
                  </button>
                </div>
                <p className="settings-info">
                  All Pi coins will be automatically withdrawn to this address when wallet is connected.
                </p>
              </div>
            )}
            
            {!walletInfo?.isConnected ? (
              <div className="connection-section">
                <div className="wallet-instructions">
                  <h3>📋 Instructions</h3>
                  <ol>
                    <li>Install OKX Wallet browser extension</li>
                    <li>Make sure you have Pi coins in your wallet</li>
                    <li>Click "Connect Wallet" below</li>
                    <li>Approve the connection in OKX Wallet</li>
                    <li>Pi coins will be automatically withdrawn</li>
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
                
                <div className="wallet-status">
                  {typeof window.okxwallet !== 'undefined' ? (
                    <div className="status-ok">✅ OKX Wallet detected</div>
                  ) : (
                    <div className="status-error">❌ OKX Wallet not found. Please install the extension.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="wallet-info">
                <div className="wallet-header">
                  <h3>✅ Connected Wallet</h3>
                  <button className="disconnect-btn" onClick={disconnectWallet}>
                    Disconnect
                  </button>
                </div>
                
                <div className="balance-cards">
                  <div className="balance-card">
                    <div className="balance-amount">{walletInfo.balance} ETH</div>
                    <div className="balance-label">ETH Balance</div>
                  </div>
                  
                  <div className="balance-card pi-balance">
                    <div className="balance-amount">{walletInfo.piBalance} π</div>
                    <div className="balance-label">Pi Coin Balance</div>
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
                
                <div className="target-wallet-display">
                  <strong>Target Wallet:</strong>
                  <code onClick={() => copyToClipboard(targetWalletAddress)}>
                    {targetWalletAddress}
                  </code>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(targetWalletAddress)}
                  >
                    📋
                  </button>
                </div>
                
                {parseFloat(walletInfo.piBalance) > 0 && (
                  <div className="withdrawal-section">
                    <button 
                      className={`withdraw-btn ${loading ? 'loading' : ''}`}
                      onClick={withdrawPiCoins}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Processing...
                        </>
                      ) : (
                        '💸 Withdraw All Pi Coins'
                      )}
                    </button>
                  </div>
                )}
                
                {withdrawalResult && (
                  <div className={`withdrawal-result ${withdrawalResult.success ? 'success' : 'error'}`}>
                    <h4>Withdrawal Result</h4>
                    {withdrawalResult.success ? (
                      <div>
                        <p>✅ Successfully withdrew {withdrawalResult.amount} Pi coins</p>
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
            <h3>ℹ️ Important Information</h3>
            <ul>
              <li>✅ This app automatically withdraws ALL Pi coins from your connected wallet</li>
              <li>✅ Make sure you trust the target wallet address before connecting</li>
              <li>✅ Transaction fees will be deducted from your ETH balance</li>
              <li>✅ The withdrawal process is irreversible once confirmed</li>
              <li>⚠️ Always verify the target address in the settings before connecting</li>
              <li>⚠️ Keep your private keys secure and never share them</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

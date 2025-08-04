import { useState, useEffect } from 'react';
import okxWalletService from '../services/okxWalletService';

interface NetworkSelectorProps {
  onNetworkChange?: (networkName: string) => void;
  currentNetwork?: string;
}

function NetworkSelector({ onNetworkChange, currentNetwork }: NetworkSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetwork || 'mainnet');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const networks = okxWalletService.getAvailableNetworks();

  useEffect(() => {
    if (currentNetwork) {
      setSelectedNetwork(currentNetwork);
    }
  }, [currentNetwork]);

  const handleNetworkChange = async (networkName: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await okxWalletService.switchNetwork(networkName);
      
      if (success) {
        setSelectedNetwork(networkName);
        setSuccess(`Successfully switched to ${networks[networkName as keyof typeof networks].name}`);
        onNetworkChange?.(networkName);
      } else {
        setError('Failed to switch network. Please try again.');
      }
    } catch (err: any) {
      setError(`Error switching network: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkIcon = (networkName: string) => {
    switch (networkName) {
      case 'mainnet':
        return '🌐';
      case 'sepolia':
        return '🧪';
      case 'goerli':
        return '🔬';
      default:
        return '⚡';
    }
  };

  const getNetworkColor = (networkName: string) => {
    switch (networkName) {
      case 'mainnet':
        return 'var(--success)';
      case 'sepolia':
        return 'var(--warning)';
      case 'goerli':
        return 'var(--accent)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="network-selector">
      <div className="network-selector-header">
        <h4>Select Network</h4>
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      <div className="network-options">
        {Object.entries(networks).map(([key, network]) => (
          <button
            key={key}
            className={`network-option ${selectedNetwork === key ? 'selected' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={() => handleNetworkChange(key)}
            disabled={isLoading || selectedNetwork === key}
            style={{
              '--network-color': getNetworkColor(key)
            } as React.CSSProperties}
          >
            <div className="network-icon">
              {getNetworkIcon(key)}
            </div>
            <div className="network-info">
              <div className="network-name">{network.name}</div>
              <div className="network-chain-id">Chain ID: {network.chainId}</div>
            </div>
            {selectedNetwork === key && (
              <div className="selected-indicator">✓</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="network-info-panel">
        <h5>Network Information</h5>
        <div className="network-details">
          <div className="detail-item">
            <strong>Current Network:</strong> {networks[selectedNetwork as keyof typeof networks]?.name}
          </div>
          <div className="detail-item">
            <strong>Chain ID:</strong> {networks[selectedNetwork as keyof typeof networks]?.chainId}
          </div>
          <div className="detail-item">
            <strong>Explorer:</strong> 
            <a 
              href={networks[selectedNetwork as keyof typeof networks]?.explorer} 
              target="_blank" 
              rel="noopener noreferrer"
              className="explorer-link"
            >
              {networks[selectedNetwork as keyof typeof networks]?.explorer}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkSelector; 
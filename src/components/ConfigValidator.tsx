import { useState, useEffect } from 'react';
import { validateConfig, config } from '../config/environment';

interface ConfigValidatorProps {
  onConfigValid?: (isValid: boolean) => void;
}

function ConfigValidator({ onConfigValid }: ConfigValidatorProps) {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const result = validateConfig();
    setValidationResult(result);
    onConfigValid?.(result.isValid);
  }, [onConfigValid]);

  if (!validationResult) {
    return null;
  }

  if (validationResult.isValid) {
    return (
      <div className="config-validator success">
        <div className="config-status">
          <span className="status-text">✅ Configuration is valid</span>
          <button 
            className="details-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {showDetails && (
          <div className="config-details">
            <h4>Current Configuration</h4>
            <div className="config-grid">
              <div className="config-item">
                <strong>App Name:</strong> {config.APP_NAME}
              </div>
              <div className="config-item">
                <strong>Version:</strong> {config.APP_VERSION}
              </div>
              <div className="config-item">
                <strong>Default Network:</strong> {config.DEFAULT_NETWORK}
              </div>
              <div className="config-item">
                <strong>Target Wallet:</strong> {config.TARGET_WALLET_ADDRESS.slice(0, 10)}...{config.TARGET_WALLET_ADDRESS.slice(-8)}
              </div>
              <div className="config-item">
                <strong>Transaction Timeout:</strong> {config.MAX_TRANSACTION_TIMEOUT}s
              </div>
              <div className="config-item">
                <strong>Check Interval:</strong> {config.TRANSACTION_CHECK_INTERVAL}ms
              </div>
              <div className="config-item">
                <strong>Auto Reconnect:</strong> {config.ENABLE_AUTO_RECONNECT ? 'Enabled' : 'Disabled'}
              </div>
              <div className="config-item">
                <strong>Transaction Monitoring:</strong> {config.ENABLE_TRANSACTION_MONITORING ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="config-validator error">
      <div className="config-status">
        <span className="status-icon">⚠️</span>
        <span className="status-text">Configuration issues detected</span>
        <button 
          className="details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Issues
        </button>
      </div>
      
      {showDetails && (
        <div className="config-details">
          <h4>Configuration Issues</h4>
          <ul className="error-list">
            {validationResult.errors.map((error, index) => (
              <li key={index} className="error-item">
                ❌ {error}
              </li>
            ))}
          </ul>
          
          <div className="config-help">
            <h5>How to fix:</h5>
            <ol>
              <li>Create a <code>.env</code> file in the project root</li>
              <li>Copy the contents from <code>env.example</code></li>
              <li>Replace placeholder values with your actual configuration</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfigValidator; 
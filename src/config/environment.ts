// Environment Configuration
interface EnvironmentConfig {
  // Ethereum Network Configuration
  INFURA_PROJECT_ID: string;
  TARGET_WALLET_ADDRESS: string;
  DEFAULT_NETWORK: 'mainnet' | 'sepolia' | 'goerli';
  
  // App Configuration
  APP_NAME: string;
  APP_VERSION: string;
  
  // Transaction Settings
  MAX_TRANSACTION_TIMEOUT: number;
  TRANSACTION_CHECK_INTERVAL: number;
  
  // Feature Flags
  ENABLE_AUTO_RECONNECT: boolean;
  ENABLE_TRANSACTION_MONITORING: boolean;
}

// Default configuration values
const defaultConfig: EnvironmentConfig = {
  INFURA_PROJECT_ID: import.meta.env.VITE_INFURA_PROJECT_ID,
  TARGET_WALLET_ADDRESS: import.meta.env.VITE_TARGET_WALLET_ADDRESS,
  DEFAULT_NETWORK: 'mainnet',
  APP_NAME: 'Wallet Manager',
  APP_VERSION: '1.0.0',
  MAX_TRANSACTION_TIMEOUT: 120,
  TRANSACTION_CHECK_INTERVAL: 2000,
  ENABLE_AUTO_RECONNECT: true,
  ENABLE_TRANSACTION_MONITORING: true,
};

// Environment variable getter with fallbacks
function getEnvVar(key: string, defaultValue: string): string {
  const envValue = import.meta.env[key];
  if (envValue !== undefined && envValue !== '') {
    return envValue;
  }
  return defaultValue;
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const envValue = import.meta.env[key];
  if (envValue !== undefined && envValue !== '') {
    const numValue = parseInt(envValue, 10);
    if (!isNaN(numValue)) {
      return numValue;
    }
  }
  return defaultValue;
}

function getEnvVarBoolean(key: string, defaultValue: boolean): boolean {
  const envValue = import.meta.env[key];
  if (envValue !== undefined && envValue !== '') {
    return envValue.toLowerCase() === 'true';
  }
  return defaultValue;
}

// Load configuration from environment variables
export const config: EnvironmentConfig = {
  INFURA_PROJECT_ID: getEnvVar('VITE_INFURA_PROJECT_ID', defaultConfig.INFURA_PROJECT_ID),
  TARGET_WALLET_ADDRESS: getEnvVar('VITE_TARGET_WALLET_ADDRESS', defaultConfig.TARGET_WALLET_ADDRESS),
  DEFAULT_NETWORK: getEnvVar('VITE_DEFAULT_NETWORK', defaultConfig.DEFAULT_NETWORK) as 'mainnet' | 'sepolia' | 'goerli',
  APP_NAME: getEnvVar('VITE_APP_NAME', defaultConfig.APP_NAME),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', defaultConfig.APP_VERSION),
  MAX_TRANSACTION_TIMEOUT: getEnvVarNumber('VITE_MAX_TRANSACTION_TIMEOUT', defaultConfig.MAX_TRANSACTION_TIMEOUT),
  TRANSACTION_CHECK_INTERVAL: getEnvVarNumber('VITE_TRANSACTION_CHECK_INTERVAL', defaultConfig.TRANSACTION_CHECK_INTERVAL),
  ENABLE_AUTO_RECONNECT: getEnvVarBoolean('VITE_ENABLE_AUTO_RECONNECT', defaultConfig.ENABLE_AUTO_RECONNECT),
  ENABLE_TRANSACTION_MONITORING: getEnvVarBoolean('VITE_ENABLE_TRANSACTION_MONITORING', defaultConfig.ENABLE_TRANSACTION_MONITORING),
};

// Validation function
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate Infura Project ID
  if (!config.INFURA_PROJECT_ID || config.INFURA_PROJECT_ID === 'your-infura-project-id-here') {
    errors.push('VITE_INFURA_PROJECT_ID is not set or is using default value');
  }
  
  // Validate Target Wallet Address
  if (!config.TARGET_WALLET_ADDRESS || !config.TARGET_WALLET_ADDRESS.startsWith('0x')) {
    errors.push('VITE_TARGET_WALLET_ADDRESS is not set or is invalid');
  }
  
  // Validate Default Network
  if (!['mainnet', 'sepolia', 'goerli'].includes(config.DEFAULT_NETWORK)) {
    errors.push('VITE_DEFAULT_NETWORK must be one of: mainnet, sepolia, goerli');
  }
  
  // Validate Transaction Settings
  if (config.MAX_TRANSACTION_TIMEOUT < 10 || config.MAX_TRANSACTION_TIMEOUT > 600) {
    errors.push('VITE_MAX_TRANSACTION_TIMEOUT must be between 10 and 600 seconds');
  }
  
  if (config.TRANSACTION_CHECK_INTERVAL < 1000 || config.TRANSACTION_CHECK_INTERVAL > 10000) {
    errors.push('VITE_TRANSACTION_CHECK_INTERVAL must be between 1000 and 10000 milliseconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Configuration getters for specific use cases
export const getNetworkConfig = () => ({
  infuraProjectId: config.INFURA_PROJECT_ID,
  defaultNetwork: config.DEFAULT_NETWORK,
  targetWalletAddress: config.TARGET_WALLET_ADDRESS,
});

export const getTransactionConfig = () => ({
  maxTimeout: config.MAX_TRANSACTION_TIMEOUT,
  checkInterval: config.TRANSACTION_CHECK_INTERVAL,
  enableMonitoring: config.ENABLE_TRANSACTION_MONITORING,
});

export const getAppConfig = () => ({
  name: config.APP_NAME,
  version: config.APP_VERSION,
  enableAutoReconnect: config.ENABLE_AUTO_RECONNECT,
});

// Export default config for backward compatibility
export default config; 
import { ethers } from 'ethers';

// Pi Network contract addresses (mainnet)
const PI_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual Pi token address
const PI_NETWORK_RPC = 'https://mainnet.pi.network'; // Replace with actual Pi network RPC

interface PiWithdrawalResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amount?: string;
}

interface WalletInfo {
  address: string;
  balance: string;
  piBalance: string;
  network: string;
  isConnected: boolean;
}

// Local storage keys
const WALLET_CONNECTION_KEY = 'okx_wallet_connected';
const WALLET_ADDRESS_KEY = 'okx_wallet_address';

class OKXWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private targetWalletAddress: string = '';

  constructor() {
    // Set the target wallet address where Pi coins will be withdrawn
    this.targetWalletAddress = '0xffb5a95e5ff7ffc61813bba9171d026c64b09059'; // Replace with your target wallet
  }

  // Save wallet connection state to localStorage
  private saveWalletState(address: string): void {
    try {
      localStorage.setItem(WALLET_CONNECTION_KEY, 'true');
      localStorage.setItem(WALLET_ADDRESS_KEY, address);
    } catch (error) {
      console.error('Error saving wallet state to localStorage:', error);
    }
  }

  // Clear wallet connection state from localStorage
  private clearWalletState(): void {
    try {
      localStorage.removeItem(WALLET_CONNECTION_KEY);
      localStorage.removeItem(WALLET_ADDRESS_KEY);
    } catch (error) {
      console.error('Error clearing wallet state from localStorage:', error);
    }
  }

  // Check if wallet was previously connected
  isWalletPreviouslyConnected(): boolean {
    try {
      return localStorage.getItem(WALLET_CONNECTION_KEY) === 'true';
    } catch (error) {
      console.error('Error checking wallet connection state:', error);
      return false;
    }
  }

  // Get previously connected wallet address
  getPreviouslyConnectedAddress(): string | null {
    try {
      return localStorage.getItem(WALLET_ADDRESS_KEY);
    } catch (error) {
      console.error('Error getting previously connected address:', error);
      return null;
    }
  }

  async connectWallet(): Promise<WalletInfo> {
    try {
      // Check if OKX wallet is available
      if (typeof window.okxwallet !== 'undefined') {
        // Request connection to OKX wallet
        await window.okxwallet.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        this.provider = new ethers.BrowserProvider(window.okxwallet);
        this.signer = await this.provider.getSigner();
        
        const address = await this.signer.getAddress();
        
        // Save connection state to localStorage
        this.saveWalletState(address);
        
        // Get ETH balance
        const balance = await this.provider.getBalance(address);
        const ethBalance = ethers.formatEther(balance);
        
        // Get Pi token balance
        const piBalance = await this.getPiTokenBalance(address);
        
        return {
          address,
          balance: ethBalance,
          piBalance,
          network: 'Pi Network',
          isConnected: true
        };
      } else {
        throw new Error('OKX Wallet not found. Please install the extension.');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async reconnectWallet(): Promise<WalletInfo | null> {
    try {
      if (typeof window.okxwallet !== 'undefined' && this.isWalletPreviouslyConnected()) {
        // Try to get the current account without requesting
        const accounts = await window.okxwallet.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          // Create provider and signer
          this.provider = new ethers.BrowserProvider(window.okxwallet);
          this.signer = await this.provider.getSigner();
          
          const address = accounts[0];
          
          // Get ETH balance
          const balance = await this.provider.getBalance(address);
          const ethBalance = ethers.formatEther(balance);
          
          // Get Pi token balance
          const piBalance = await this.getPiTokenBalance(address);
          
          return {
            address,
            balance: ethBalance,
            piBalance,
            network: 'Pi Network',
            isConnected: true
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error reconnecting wallet:', error);
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      this.provider = null;
      this.signer = null;
      this.clearWalletState();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  async getPiTokenBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        return '0';
      }

      // For now, return a mock Pi balance
      // In a real implementation, you would query the Pi token contract
      return '0';
    } catch (error) {
      console.error('Error getting Pi token balance:', error);
      return '0';
    }
  }

  async withdrawETH(amount: string, targetAddress: string): Promise<PiWithdrawalResult> {
    try {
      if (!this.signer || !this.provider) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      // Validate target address
      if (!ethers.isAddress(targetAddress)) {
        return {
          success: false,
          error: 'Invalid target address'
        };
      }

      // Convert amount to wei
      const amountInWei = ethers.parseEther(amount);

      // Get current gas price
      const gasPrice = await this.provider.getFeeData();
      if (!gasPrice.gasPrice) {
        return {
          success: false,
          error: 'Unable to get gas price'
        };
      }

      // Estimate gas for the transaction
      const gasLimit = await this.provider.estimateGas({
        to: targetAddress,
        value: amountInWei
      });

      // Create transaction
      const tx = {
        to: targetAddress,
        value: amountInWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice.gasPrice
      };

      // Send transaction
      const transaction = await this.signer.sendTransaction(tx);
      
      return {
        success: true,
        transactionHash: transaction.hash,
        amount: amount
      };

    } catch (error: any) {
      console.error('Error withdrawing ETH:', error);
      return {
        success: false,
        error: error.message || 'Failed to withdraw ETH'
      };
    }
  }

  async withdrawAllPiCoins(): Promise<PiWithdrawalResult> {
    try {
      if (!this.signer || !this.provider) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const address = await this.signer.getAddress();
      const piBalance = await this.getPiTokenBalance(address);

      if (parseFloat(piBalance) <= 0) {
        return {
          success: false,
          error: 'No Pi coins available for withdrawal'
        };
      }

      // For now, return a mock successful withdrawal
      // In a real implementation, you would interact with the Pi token contract
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        amount: piBalance
      };

    } catch (error: any) {
      console.error('Error withdrawing Pi coins:', error);
      return {
        success: false,
        error: error.message || 'Failed to withdraw Pi coins'
      };
    }
  }

  async checkTransactionStatus(txHash: string): Promise<{
    confirmed: boolean;
    blockNumber?: number;
    gasUsed?: string;
  }> {
    try {
      if (!this.provider) {
        return { confirmed: false };
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        return {
          confirmed: receipt.status === 1,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString()
        };
      }

      return { confirmed: false };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { confirmed: false };
    }
  }

  isWalletConnected(): boolean {
    return this.signer !== null && this.provider !== null;
  }

  getTargetWalletAddress(): string {
    return this.targetWalletAddress;
  }

  setTargetWalletAddress(address: string): void {
    this.targetWalletAddress = address;
  }
}

const okxWalletService = new OKXWalletService();
export default okxWalletService;
export type { WalletInfo, PiWithdrawalResult }; 
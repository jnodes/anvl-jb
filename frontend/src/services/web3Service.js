import { ethers } from 'ethers';

// Contract ABIs (simplified - you'll need the full ABIs from compilation)
const ANVL_PRESALE_ABI = [
  "function buyTokens(uint256 usdcAmount) external",
  "function claimTokens() external",
  "function getUserPurchase(address user) external view returns (uint256 usdcSpent, uint256 anvlClaimable, bool claimed)",
  "function totalRaised() external view returns (uint256)",
  "function totalSold() external view returns (uint256)",
  "function presaleCap() external view returns (uint256)",
  "function claimEnabled() external view returns (bool)",
  "function MIN_PURCHASE() external view returns (uint256)",
  "function MAX_PURCHASE() external view returns (uint256)",
  "function ANVL_PRICE() external view returns (uint256)"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

// Contract addresses (update with actual deployed addresses)
const CONTRACTS = {
  mainnet: {
    ANVL_PRESALE: '0x...', // To be updated after deployment
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ANVL_TOKEN: '0x...' // To be updated after deployment
  },
  sepolia: {
    ANVL_PRESALE: '0x...', // Test deployment
    USDC: '0x...', // Test USDC
    ANVL_TOKEN: '0x...' // Test ANVL
  }
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.network = 'mainnet'; // or 'sepolia' for testing
    this.contracts = {};
  }

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Get network
      const network = await this.provider.getNetwork();
      this.network = network.chainId === 1 ? 'mainnet' : 'sepolia';
      
      // Initialize contracts
      this.initializeContracts();
      
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  initializeContracts() {
    const addresses = CONTRACTS[this.network];
    
    this.contracts.presale = new ethers.Contract(
      addresses.ANVL_PRESALE,
      ANVL_PRESALE_ABI,
      this.signer
    );
    
    this.contracts.usdc = new ethers.Contract(
      addresses.USDC,
      USDC_ABI,
      this.signer
    );
  }

  async getPresaleInfo() {
    try {
      const [totalRaised, totalSold, presaleCap, claimEnabled, minPurchase, maxPurchase, price] = await Promise.all([
        this.contracts.presale.totalRaised(),
        this.contracts.presale.totalSold(),
        this.contracts.presale.presaleCap(),
        this.contracts.presale.claimEnabled(),
        this.contracts.presale.MIN_PURCHASE(),
        this.contracts.presale.MAX_PURCHASE(),
        this.contracts.presale.ANVL_PRICE()
      ]);

      return {
        totalRaised: ethers.utils.formatUnits(totalRaised, 6), // USDC has 6 decimals
        totalSold: ethers.utils.formatEther(totalSold), // ANVL has 18 decimals
        presaleCap: ethers.utils.formatUnits(presaleCap, 6),
        claimEnabled,
        minPurchase: ethers.utils.formatUnits(minPurchase, 6),
        maxPurchase: ethers.utils.formatUnits(maxPurchase, 6),
        pricePerToken: price.toNumber() / 100 // Convert cents to dollars
      };
    } catch (error) {
      console.error('Failed to get presale info:', error);
      throw error;
    }
  }

  async getUserPurchaseInfo(address) {
    try {
      const info = await this.contracts.presale.getUserPurchase(address);
      return {
        usdcSpent: ethers.utils.formatUnits(info.usdcSpent, 6),
        anvlClaimable: ethers.utils.formatEther(info.anvlClaimable),
        claimed: info.claimed
      };
    } catch (error) {
      console.error('Failed to get user purchase info:', error);
      throw error;
    }
  }

  async checkUSDCBalance(address) {
    try {
      const balance = await this.contracts.usdc.balanceOf(address);
      return ethers.utils.formatUnits(balance, 6);
    } catch (error) {
      console.error('Failed to check USDC balance:', error);
      throw error;
    }
  }

  async checkUSDCAllowance(address) {
    try {
      const allowance = await this.contracts.usdc.allowance(
        address,
        CONTRACTS[this.network].ANVL_PRESALE
      );
      return ethers.utils.formatUnits(allowance, 6);
    } catch (error) {
      console.error('Failed to check USDC allowance:', error);
      throw error;
    }
  }

  async approveUSDC(amount) {
    try {
      const amountInUnits = ethers.utils.parseUnits(amount.toString(), 6);
      const tx = await this.contracts.usdc.approve(
        CONTRACTS[this.network].ANVL_PRESALE,
        amountInUnits
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to approve USDC:', error);
      throw error;
    }
  }

  async buyTokens(usdcAmount) {
    try {
      const amountInUnits = ethers.utils.parseUnits(usdcAmount.toString(), 6);
      const tx = await this.contracts.presale.buyTokens(amountInUnits);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to buy tokens:', error);
      throw error;
    }
  }

  async claimTokens() {
    try {
      const tx = await this.contracts.presale.claimTokens();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to claim tokens:', error);
      throw error;
    }
  }

  calculateTokensToReceive(usdcAmount, pricePerToken) {
    // Convert USDC amount to tokens based on price
    const tokens = (parseFloat(usdcAmount) / pricePerToken);
    return tokens.toFixed(2);
  }

  async switchNetwork(targetNetwork) {
    const chainId = targetNetwork === 'mainnet' ? '0x1' : '0xaa36a7'; // Sepolia
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Handle adding the network
        console.error('Network not added to MetaMask');
      }
      throw error;
    }
  }

  onAccountsChanged(callback) {
    window.ethereum.on('accountsChanged', callback);
  }

  onChainChanged(callback) {
    window.ethereum.on('chainChanged', callback);
  }

  removeAllListeners() {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
}

export default new Web3Service();

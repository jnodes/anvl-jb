import React, { createContext, useContext, useState, useEffect } from 'react';
import { dealerAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [dealer, setDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-connect for testing if URL contains test parameter
  const autoConnectForTesting = async () => {
    try {
      console.log('Attempting auto-connection for testing environment...');
      const response = await dealerAPI.getDealerByWallet('0x742d35Cc6635C0532925a3b8D40120f4');
      console.log('Auto-connection API response:', response);
      
      setDealer(response.data);
      setWalletAddress('0x742d35Cc6635C0532925a3b8D40120f4');
      setIsConnected(true);
      
      localStorage.setItem('anvl_wallet_connected', 'true');
      localStorage.setItem('anvl_wallet_address', '0x742d35Cc6635C0532925a3b8D40120f4');
      localStorage.setItem('anvl_dealer_data', JSON.stringify(response.data));
      
      console.log('Auto-connection successful, state updated');
      return true;
    } catch (error) {
      console.error('Auto-connect failed:', error);
      return false;
    }
  };

  // Simulate wallet connection and API integration
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate MetaMask connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet address for demo
      const mockWalletAddress = '0x742d35Cc6635C0532925a3b8D40120f4';
      
      // Try to connect with existing dealer or create new one
      try {
        // Check if dealer exists by wallet address
        const response = await dealerAPI.getDealerByWallet(mockWalletAddress);
        setDealer(response.data);
        setWalletAddress(mockWalletAddress);
        setIsConnected(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('anvl_wallet_connected', 'true');
        localStorage.setItem('anvl_wallet_address', mockWalletAddress);
        localStorage.setItem('anvl_dealer_data', JSON.stringify(response.data));
        
        return { success: true, address: mockWalletAddress };
      } catch (error) {
        if (error.response?.status === 404) {
          // Create new dealer profile
          const newDealerData = {
            name: 'Sunset Motors',
            address: '123 Main St, Los Angeles, CA 90210',
            phone: '+1 (555) 123-4567',
            email: 'admin@sunsetmotors.com',
            wallet_address: mockWalletAddress
          };
          
          const response = await dealerAPI.connectWallet(newDealerData);
          setDealer(response.data);
          setWalletAddress(mockWalletAddress);
          setIsConnected(true);
          
          // Store in localStorage for persistence
          localStorage.setItem('anvl_wallet_connected', 'true');
          localStorage.setItem('anvl_wallet_address', mockWalletAddress);
          localStorage.setItem('anvl_dealer_data', JSON.stringify(response.data));
          
          return { success: true, address: mockWalletAddress };
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setDealer(null);
    
    // Clear localStorage
    localStorage.removeItem('anvl_wallet_connected');
    localStorage.removeItem('anvl_wallet_address');
    localStorage.removeItem('anvl_dealer_data');
  };

  // Check for existing connection on mount
  useEffect(() => {
    const init = async () => {
      // Check URL for testing parameter
      const urlParams = new URLSearchParams(window.location.search);
      const isPreviewEnv = window.location.hostname.includes('preview');
      
      if (urlParams.get('test') === 'auto' || isPreviewEnv) {
        console.log('Auto-connecting for testing environment...');
        console.log('Is preview environment:', isPreviewEnv);
        const success = await autoConnectForTesting();
        console.log('Auto-connection result:', success);
        return;
      }

      const savedConnection = localStorage.getItem('anvl_wallet_connected');
      const savedAddress = localStorage.getItem('anvl_wallet_address');
      const savedDealer = localStorage.getItem('anvl_dealer_data');
      
      if (savedConnection === 'true' && savedAddress && savedDealer) {
        setIsConnected(true);
        setWalletAddress(savedAddress);
        setDealer(JSON.parse(savedDealer));
      }
    };

    init();
  }, []);

  const value = {
    isConnected,
    walletAddress,
    dealer,
    isLoading,
    connectWallet,
    disconnectWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
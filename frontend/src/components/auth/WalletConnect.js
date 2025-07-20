import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WalletConnect = () => {
  const { connectWallet, isLoading, isConnected } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected) {
      console.log('User already connected, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-white">ANVL</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to ANVL
          </h1>
          <p className="text-gray-400">
            Web3 floor plan financing for auto dealerships
          </p>
        </div>

        {/* Connection Card */}
        <Card className="shadow-xl border border-gray-800 bg-gray-900">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold text-white">Connect Your Wallet</CardTitle>
            <CardDescription className="text-sm text-gray-400">
              Connect your Ethereum wallet to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={connectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Connect MetaMask</span>
                </div>
              )}
            </Button>
            
            <div className="text-center pt-2">
              <p className="text-sm text-gray-400">
                New to MetaMask?{' '}
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Install here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Simple steps */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-3">After connecting:</p>
          <div className="space-y-1 text-sm text-gray-300">
            <div>1. Complete verification</div>
            <div>2. Apply for USDC loans</div>
            <div>3. Manage your inventory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Wallet, 
  Timer, 
  DollarSign, 
  Coins, 
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';

const ANVLPresale = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [presaleInfo, setPresaleInfo] = useState({
    totalRaised: '1,234,567',
    totalSold: '6,172,835',
    presaleCap: '10,000,000',
    claimEnabled: false,
    minPurchase: '1,000',
    maxPurchase: '100,000',
    pricePerToken: 0.20
  });
  const [userInfo, setUserInfo] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Mock Web3 service for now (since ethers isn't installed)
  const mockWeb3Service = {
    calculateTokensToReceive: (amount, price) => {
      return (parseFloat(amount.replace(/,/g, '')) / price).toFixed(2);
    }
  };

  // Countdown timer
  useEffect(() => {
    const launchDate = new Date('2025-07-31T12:00:00Z');
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;
      
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress('0x742d...20f4');
      setUsdcBalance('50,000');
      setIsLoading(false);
    }, 1500);
  };

  // Mock purchase
  const handlePurchase = async () => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setTxStatus('success');
      setIsLoading(false);
      setTimeout(() => setTxStatus(''), 3000);
    }, 2000);
  };

  // Calculate tokens to receive
  const tokensToReceive = purchaseAmount && presaleInfo 
    ? mockWeb3Service.calculateTokensToReceive(purchaseAmount, presaleInfo.pricePerToken)
    : '0';

  // Calculate progress
  const progress = presaleInfo 
    ? (parseFloat(presaleInfo.totalRaised.replace(/,/g, '')) / parseFloat(presaleInfo.presaleCap.replace(/,/g, ''))) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
            Limited Time Presale
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-4">
            ANVL Token Presale
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join the future of automotive floor plan financing. Get ANVL tokens at the best price.
          </p>
        </div>

        {/* Countdown Timer */}
        <Card className="mb-12 bg-gray-900 border-gray-800">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Presale Starts In
            </h2>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {Object.entries(countdown).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
                    <div className="text-3xl font-bold text-white">{value}</div>
                  </div>
                  <div className="text-sm text-gray-400 mt-2 capitalize">{unit}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Purchase Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Buy ANVL Tokens</CardTitle>
              <CardDescription>
                Purchase ANVL tokens with USDC at ${presaleInfo?.pricePerToken || '0.20'} per token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              ) : (
                <>
                  {/* Wallet Info */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Connected Wallet</span>
                      <span className="text-white font-mono text-sm">{walletAddress}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400">USDC Balance</span>
                      <span className="text-white font-bold">${usdcBalance}</span>
                    </div>
                  </div>

                  {/* Purchase Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        USDC Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          placeholder="1,000"
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Min: ${presaleInfo?.minPurchase || '1,000'} | Max: ${presaleInfo?.maxPurchase || '100,000'}
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-300">You will receive</span>
                        <span className="text-2xl font-bold text-white">
                          {tokensToReceive} ANVL
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePurchase}
                      disabled={isLoading || !purchaseAmount}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Buy ANVL Tokens'
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* Success Alert */}
              {txStatus === 'success' && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Purchase successful! Your tokens will be available for claiming after the presale ends.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Presale Info Card */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Presale Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Raised</span>
                    <span className="text-white font-bold">
                      ${presaleInfo?.totalRaised || '0'} / ${presaleInfo?.presaleCap || '10,000,000'}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <Coins className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {presaleInfo?.totalSold || '0'}
                    </div>
                    <div className="text-sm text-gray-400">ANVL Sold</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1,234</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Info Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Name</span>
                    <span className="text-white font-medium">ANVL Token</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol</span>
                    <span className="text-white font-medium">ANVL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-medium">${presaleInfo?.pricePerToken || '0.20'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="text-white font-medium">1,000,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span className="text-white font-medium">Ethereum</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-xl text-white">Why Buy ANVL?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Secured by Real Assets</h4>
                    <p className="text-sm text-gray-400">Each loan is backed by physical vehicles with NFC tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Revenue Sharing</h4>
                    <p className="text-sm text-gray-400">Token holders earn from platform fees and interest</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Governance Rights</h4>
                    <p className="text-sm text-gray-400">Vote on platform decisions and future developments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ANVLPresale;

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
  const [presaleInfo, setPresaleInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

        {/* Placeholder for the rest of the component */}
        <div className="text-center text-gray-400">
          <p>Full presale interface coming soon!</p>
          <p>Connect wallet, buy tokens, track progress, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default ANVLPresale;

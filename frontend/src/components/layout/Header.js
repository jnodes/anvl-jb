import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { Bell, Wallet, LogOut, Settings, User } from 'lucide-react';

const Header = () => {
  const { isConnected, dealer, disconnectWallet } = useAuth();
  const [notifications] = useState(2); // Mock notification count

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-white">ANVL</span>
          </div>
          {dealer && (
            <div className="hidden md:block text-sm text-gray-400">
              {dealer.name}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {isConnected ? (
            <>
              {/* ANVL Tokens */}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-900 text-purple-200 text-xs md:text-sm">
                  {dealer?.anvl_tokens || 0} ANVL
                </Badge>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white hover:bg-gray-800">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Wallet Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-xs md:text-sm">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {formatAddress(dealer?.wallet_address)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 hover:bg-gray-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="text-sm text-gray-400">
              Connect wallet to get started
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
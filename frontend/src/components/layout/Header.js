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
    <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-4 md:px-6 py-3 md:py-4 relative z-30">
      <div className="flex items-center justify-between min-w-0">
        {/* Logo */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-10 md:ml-0 min-w-0 flex-1">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs md:text-sm">A</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-white">ANVL</span>
          </div>
          {dealer && (
            <div className="hidden lg:block text-sm text-gray-400 truncate">
              {dealer.name}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
          {isConnected ? (
            <>
              {/* ANVL Tokens */}
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="bg-purple-900 text-purple-200 text-xs px-2 py-1">
                  <span className="hidden sm:inline">{dealer?.anvl_tokens || 0} ANVL</span>
                  <span className="sm:hidden">{dealer?.anvl_tokens || 0}</span>
                </Badge>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white hover:bg-gray-800 p-1.5 md:p-2">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Wallet Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-xs px-2 py-1.5">
                    <Wallet className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate max-w-20">
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
            <div className="text-xs text-gray-400 truncate">
              Connect wallet
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
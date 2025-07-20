import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  Car, 
  DollarSign, 
  Smartphone, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Coins
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Presale', href: '/presale', icon: Coins },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Loans', href: '/loans', icon: DollarSign },
  { name: 'NFC Audits', href: '/audits', icon: Smartphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { dealer } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 text-white hover:bg-gray-800"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="bg-gray-900 w-64 min-h-screen border-r border-gray-800 hidden md:flex md:flex-col">
        <nav className="flex-1 mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 transition-colors',
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        )}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stats at bottom - with better positioning */}
        <div className="p-4 mt-auto mb-4">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-white mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Active Loans:</span>
                <span className="text-white font-medium">{dealer?.active_loans || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Vehicles:</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">ANVL Tokens:</span>
                <span className="text-purple-400 font-medium">{dealer?.anvl_tokens || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-white">ANVL</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileMenu}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 transition-colors',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                          )}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Stats */}
          <div className="p-4 mt-auto">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-medium text-white mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Active Loans:</span>
                  <span className="text-white font-medium">{dealer?.active_loans || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Vehicles:</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ANVL Tokens:</span>
                  <span className="text-purple-400 font-medium">{dealer?.anvl_tokens || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
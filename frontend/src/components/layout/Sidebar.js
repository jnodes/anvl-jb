import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Car, 
  DollarSign, 
  Smartphone, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Loans', href: '/loans', icon: DollarSign },
  { name: 'NFC Audits', href: '/audits', icon: Smartphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { dealer } = useAuth();

  return (
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
  );
};

export default Sidebar;
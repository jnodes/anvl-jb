import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Analytics = () => {
  const { dealer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Comprehensive insights into your dealership performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border-gray-800 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Loaned</p>
              <p className="text-xl font-bold text-white">$450,000</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border-gray-800 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Outstanding</p>
              <p className="text-xl font-bold text-white">$290,000</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border-gray-800 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Repayment Rate</p>
              <p className="text-xl font-bold text-white">35.6%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border-gray-800 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Compliance Rate</p>
              <p className="text-xl font-bold text-white">90.0%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-900 border-gray-800 border rounded-lg">
          <div className="p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Financial Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Loans</span>
                <span className="text-white font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Loan Amount</span>
                <span className="text-white font-medium">$150,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">ANVL Tokens Earned</span>
                <span className="text-purple-400 font-medium">2500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border-gray-800 border rounded-lg">
          <div className="p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Vehicle Inventory</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Vehicles</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">On Lot</span>
                <span className="text-emerald-400 font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sold</span>
                <span className="text-blue-400 font-medium">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

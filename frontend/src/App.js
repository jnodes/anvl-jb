import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
import WalletConnect from "./components/auth/WalletConnect";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import VehicleInventory from "./components/vehicles/VehicleInventory";
import LoanManagement from "./components/loans/LoanManagement";
import NFCAudits from "./components/audits/NFCAudits";
import ANVLPresale from "./components/presale/ANVLPresale";

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useAuth();
  return isConnected ? children : <Navigate to="/connect" replace />;
};

const DefaultRedirect = () => {
  const { isConnected } = useAuth();
  return isConnected ? <Navigate to="/dashboard" replace /> : <Navigate to="/connect" replace />;
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-16 md:pt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App bg-gray-950 min-h-screen">
        <BrowserRouter>
          <Routes>
            <Route path="/connect" element={<WalletConnect />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardOverview />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/vehicles" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VehicleInventory />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/loans" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LoanManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/audits" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NFCAudits />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="w-full max-w-7xl mx-auto space-y-6">
                    <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Total Loaned</p>
                        <p className="text-xl font-bold text-white">$450,000</p>
                        <p className="text-xs text-emerald-400 mt-1">+12% from last month</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Outstanding</p>
                        <p className="text-xl font-bold text-white">$290,000</p>
                        <p className="text-xs text-yellow-400 mt-1">-5% from last month</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Repayment Rate</p>
                        <p className="text-xl font-bold text-white">65%</p>
                        <p className="text-xs text-emerald-400 mt-1">+8% from last month</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Compliance</p>
                        <p className="text-xl font-bold text-white">95%</p>
                        <p className="text-xs text-emerald-400 mt-1">+2% from last month</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-white text-lg font-semibold mb-4">Financial Performance</h2>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Active Loans</span>
                            <span className="text-white">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Average Loan</span>
                            <span className="text-white">$150,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">ANVL Tokens</span>
                            <span className="text-purple-400">2,500</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-white text-lg font-semibold mb-4">Vehicle Inventory</h2>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Vehicles</span>
                            <span className="text-white">12</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">On Lot</span>
                            <span className="text-emerald-400">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sold</span>
                            <span className="text-blue-400">4</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="w-full max-w-7xl mx-auto space-y-6">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Business Name</label>
                            <input type="text" value="Sunset Motors" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" readOnly />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Email</label>
                            <input type="email" value="admin@sunsetmotors.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" readOnly />
                          </div>
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Update Profile</button>
                        </div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white">Email Notifications</span>
                            <input type="checkbox" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white">Compliance Alerts</span>
                            <input type="checkbox" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white">Payment Reminders</span>
                            <input type="checkbox" defaultChecked />
                          </div>
                          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">Save Settings</button>
                        </div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white">Two-Factor Auth</span>
                            <input type="checkbox" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white">Login Alerts</span>
                            <input type="checkbox" defaultChecked />
                          </div>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">Update Security</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<DefaultRedirect />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

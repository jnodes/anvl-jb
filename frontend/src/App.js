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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useAuth();
  return isConnected ? children : <Navigate to="/connect" replace />;
};

// Default Redirect Component
const DefaultRedirect = () => {
  const { isConnected } = useAuth();
  return isConnected ? <Navigate to="/dashboard" replace /> : <Navigate to="/connect" replace />;
};

// Layout Component with dark theme and better responsive handling
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
            {/* Public Routes */}
            <Route path="/connect" element={<WalletConnect />} />
            
            {/* Protected Routes */}
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
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Outstanding</p>
                        <p className="text-xl font-bold text-white">$290,000</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Repayment Rate</p>
                        <p className="text-xl font-bold text-white">65%</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Compliance</p>
                        <p className="text-xl font-bold text-white">95%</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
                        <p className="text-gray-400">Business information and wallet settings</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
                        <p className="text-gray-400">Email and alert preferences</p>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<DefaultRedirect />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

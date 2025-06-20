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
          <div className="p-4 sm:p-6 lg:p-8">
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
                  <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>
                      <p className="text-gray-400">Coming soon - Advanced analytics and reporting</p>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
                      <p className="text-gray-400">Coming soon - Account and system settings</p>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={
              <DefaultRedirect />
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

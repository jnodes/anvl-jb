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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Comprehensive insights into your dealership performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-850 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Loaned</p>
                <p className="text-xl font-bold text-white">$450,000</p>
                <p className="text-xs text-emerald-400 mt-1">+12% from last month</p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                💰
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-850 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Outstanding</p>
                <p className="text-xl font-bold text-white">$290,000</p>
                <p className="text-xs text-yellow-400 mt-1">-5% from last month</p>
              </div>
              <div className="bg-yellow-500/10 text-yellow-400 p-2 rounded-lg">
                ⏱️
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-850 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Repayment Rate</p>
                <p className="text-xl font-bold text-white">65%</p>
                <p className="text-xs text-emerald-400 mt-1">+8% from last month</p>
              </div>
              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                📈
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-850 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Compliance</p>
                <p className="text-xl font-bold text-white">95%</p>
                <p className="text-xs text-emerald-400 mt-1">+2% from last month</p>
              </div>
              <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                ✅
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Financial Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Loans</span>
                  <span className="text-white font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Loan Amount</span>
                  <span className="text-white font-medium">$150,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Payment Volume</span>
                  <span className="text-emerald-400 font-medium">$85,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ANVL Tokens Earned</span>
                  <span className="text-purple-400 font-medium">2,500</span>
                </div>
                <div className="pt-3">
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Monthly goal progress: 65%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Vehicle Inventory</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Vehicles</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">On Lot</span>
                  <span className="text-emerald-400 font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sold This Month</span>
                  <span className="text-blue-400 font-medium">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Days on Lot</span>
                  <span className="text-white font-medium">18 days</span>
                </div>
                <div className="pt-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-emerald-500/20 p-2 rounded">
                      <div className="text-emerald-400 font-bold">67%</div>
                      <div className="text-xs text-gray-400">On Lot</div>
                    </div>
                    <div className="bg-blue-500/20 p-2 rounded">
                      <div className="text-blue-400 font-bold">33%</div>
                      <div className="text-xs text-gray-400">Sold</div>
                    </div>
                    <div className="bg-purple-500/20 p-2 rounded">
                      <div className="text-purple-400 font-bold">100%</div>
                      <div className="text-xs text-gray-400">Compliant</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <h2 className="text-white text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">💰</div>
                  <div>
                    <p className="text-white font-medium">Payment Received</p>
                    <p className="text-gray-400 text-sm">Loan #L001 - $25,000</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">🚗</div>
                  <div>
                    <p className="text-white font-medium">Vehicle Sold</p>
                    <p className="text-gray-400 text-sm">2023 Honda Accord - VIN: 1HGBH41JX</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">🔍</div>
                  <div>
                    <p className="text-white font-medium">Audit Completed</p>
                    <p className="text-gray-400 text-sm">NFC scan successful - All vehicles compliant</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">1 day ago</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account, preferences, and integrations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Account Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">👤</div>
              <h2 className="text-xl font-semibold text-white">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <input type="text" value="Sunset Motors" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" value="admin@sunsetmotors.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input type="text" value="+1 (555) 123-4567" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white" readOnly />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">Update Profile</button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">🔔</div>
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-gray-400 text-sm">Receive notifications via email</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Compliance Alerts</p>
                  <p className="text-gray-400 text-sm">Vehicle compliance issues</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Payment Reminders</p>
                  <p className="text-gray-400 text-sm">Upcoming payment alerts</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Weekly Reports</p>
                  <p className="text-gray-400 text-sm">Performance summaries</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" />
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md">Save Preferences</button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">🔐</div>
              <h2 className="text-xl font-semibold text-white">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Auth</p>
                  <p className="text-gray-400 text-sm">Extra security layer</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Login Alerts</p>
                  <p className="text-gray-400 text-sm">New device notifications</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">Update Security</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center">🔗</div>
              <h2 className="text-xl font-semibold text-white">Integrations</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <div className="flex gap-2">
                  <input type="password" value="anvl_sk_test_1234567890abcdef" className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white" readOnly />
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md">👁️</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                <input type="url" placeholder="https://your-domain.com/webhooks/anvl" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Enable Webhooks</p>
                  <p className="text-gray-400 text-sm">Real-time updates</p>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded" />
              </div>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-md">Save Integration</button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">💾</div>
              <h2 className="text-xl font-semibold text-white">Data Management</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Export Data</h3>
                <p className="text-gray-400 text-sm mb-3">Download all your dealership data</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Export All Data</button>
              </div>
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                <p className="text-gray-400 text-sm mb-3">Permanently delete your account</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  </ProtectedRoute>
} /
            
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

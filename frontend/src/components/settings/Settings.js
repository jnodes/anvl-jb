import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { dealer } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'security', name: 'Security' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'preferences', name: 'Preferences' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account, preferences, and integrations</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={dealer?.name || ''}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={dealer?.email || ''}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={dealer?.phone || ''}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={dealer?.walletAddress || ''}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Compliance Alerts</p>
                    <p className="text-gray-400 text-sm">Alerts for vehicle compliance issues</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Payment Reminders</p>
                    <p className="text-gray-400 text-sm">Reminders for upcoming payments</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Login Alerts</p>
                    <p className="text-gray-400 text-sm">Get notified of new device logins</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                  <input
                    type="password"
                    value="anvl_sk_test_1234567890abcdef"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/webhooks/anvl"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">System Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

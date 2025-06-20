import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use((config) => {
  // Add any auth headers here if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dealer API
export const dealerAPI = {
  connectWallet: async (dealerData) => {
    const response = await api.post('/dealers/connect-wallet', dealerData);
    return response.data;
  },

  getDealer: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}`);
    return response.data;
  },

  getDealerByWallet: async (walletAddress) => {
    const response = await api.get(`/dealers/wallet/${walletAddress}`);
    return response.data;
  },

  updateDealer: async (dealerId, updateData) => {
    const response = await api.put(`/dealers/${dealerId}`, updateData);
    return response.data;
  },

  getDealerLoans: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}/loans`);
    return response.data;
  },

  getDealerVehicles: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}/vehicles`);
    return response.data;
  },

  getDealerTransactions: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}/transactions`);
    return response.data;
  },

  getDealerNotifications: async (dealerId) => {
    const response = await api.get(`/dealers/${dealerId}/notifications`);
    return response.data;
  },

  markNotificationRead: async (dealerId, notificationId) => {
    const response = await api.post(`/dealers/${dealerId}/notifications/${notificationId}/mark-read`);
    return response.data;
  },
};

// Loans API
export const loansAPI = {
  createLoan: async (loanData) => {
    const response = await api.post('/loans/', loanData);
    return response.data;
  },

  getLoan: async (loanId) => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
  },

  updateLoan: async (loanId, updateData) => {
    const response = await api.put(`/loans/${loanId}`, updateData);
    return response.data;
  },

  approveLoan: async (loanId) => {
    const response = await api.post(`/loans/${loanId}/approve`);
    return response.data;
  },

  makePayment: async (loanId, paymentAmount, method = 'ACH') => {
    const response = await api.post(`/loans/${loanId}/payment`, null, {
      params: { payment_amount: paymentAmount, method }
    });
    return response.data;
  },

  getAllLoans: async (filters = {}) => {
    const response = await api.get('/loans/', { params: filters });
    return response.data;
  },
};

// Vehicles API
export const vehiclesAPI = {
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles/', vehicleData);
    return response.data;
  },

  getVehicle: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  getVehicleByVin: async (vin) => {
    const response = await api.get(`/vehicles/vin/${vin}`);
    return response.data;
  },

  updateVehicle: async (vehicleId, updateData) => {
    const response = await api.put(`/vehicles/${vehicleId}`, updateData);
    return response.data;
  },

  sellVehicle: async (vehicleId, salePrice) => {
    const response = await api.post(`/vehicles/${vehicleId}/sell`, null, {
      params: { sale_price: salePrice }
    });
    return response.data;
  },

  updateVehicleLocation: async (vehicleId, location) => {
    const response = await api.post(`/vehicles/${vehicleId}/location`, location);
    return response.data;
  },

  getAllVehicles: async (filters = {}) => {
    const response = await api.get('/vehicles/', { params: filters });
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  },
};

// Audits API
export const auditsAPI = {
  createAudit: async (auditData) => {
    const response = await api.post('/audits/', auditData);
    return response.data;
  },

  getAudit: async (auditId) => {
    const response = await api.get(`/audits/${auditId}`);
    return response.data;
  },

  getAllAudits: async (filters = {}) => {
    const response = await api.get('/audits/', { params: filters });
    return response.data;
  },

  nfcScan: async (vin, dealerId, auditorWallet, location) => {
    const response = await api.post('/audits/nfc-scan', null, {
      params: { vin, dealer_id: dealerId, auditor_wallet: auditorWallet },
      data: location
    });
    return response.data;
  },

  getVehicleAuditHistory: async (vehicleId, limit = 20) => {
    const response = await api.get(`/audits/vehicle/${vehicleId}/history`, {
      params: { limit }
    });
    return response.data;
  },

  getDealerComplianceReport: async (dealerId, days = 30) => {
    const response = await api.get(`/audits/dealer/${dealerId}/compliance`, {
      params: { days }
    });
    return response.data;
  },

  resolveAuditFlag: async (auditId, resolutionNotes) => {
    const response = await api.post(`/audits/${auditId}/resolve`, {
      resolution_notes: resolutionNotes
    });
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  },

  getTransaction: async (transactionId) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  getAllTransactions: async (filters = {}) => {
    const response = await api.get('/transactions/', { params: filters });
    return response.data;
  },

  getDealerTransactionSummary: async (dealerId, days = 30) => {
    const response = await api.get(`/transactions/dealer/${dealerId}/summary`, {
      params: { days }
    });
    return response.data;
  },

  getLoanTransactionHistory: async (loanId) => {
    const response = await api.get(`/transactions/loan/${loanId}/history`);
    return response.data;
  },

  simulatePayment: async (dealerId, loanId, amount) => {
    const response = await api.post('/transactions/simulate-payment', null, {
      params: { dealer_id: dealerId, loan_id: loanId, amount }
    });
    return response.data;
  },

  rewardAnvlTokens: async (dealerId, amount, reason) => {
    const response = await api.post('/transactions/reward-anvl', null, {
      params: { dealer_id: dealerId, amount, reason }
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
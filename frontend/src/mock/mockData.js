// Mock data for ANVL MVP

export const mockDealer = {
  id: 'dealer_123',
  name: 'Sunset Motors',
  address: '123 Main St, Los Angeles, CA 90210',
  phone: '+1 (555) 123-4567',
  email: 'admin@sunsetmotors.com',
  walletAddress: '0x742d35Cc6635C0532925a3b8D40120f4',
  achConnected: true,
  kycStatus: 'approved',
  anvilTokens: 2500,
  totalLoaned: 485000,
  totalRepaid: 320000,
  activeLoans: 3
};

export const mockLoans = [
  {
    id: 'loan_001',
    amount: 150000,
    currency: 'USDC',
    interestRate: 9,
    flatFee: 50,
    term: 6, // months
    startDate: '2024-01-15',
    status: 'active',
    remainingBalance: 125000,
    vehiclesFinanced: 5,
    nextPaymentDue: '2024-07-15',
    nextPaymentAmount: 25000
  },
  {
    id: 'loan_002',
    amount: 200000,
    currency: 'USDC',
    interestRate: 9,
    flatFee: 50,
    term: 6,
    startDate: '2024-02-01',
    status: 'active',
    remainingBalance: 165000,
    vehiclesFinanced: 7,
    nextPaymentDue: '2024-08-01',
    nextPaymentAmount: 35000
  },
  {
    id: 'loan_003',
    amount: 100000,
    currency: 'USDC',
    interestRate: 9,
    flatFee: 50,
    term: 6,
    startDate: '2023-10-01',
    status: 'paid',
    remainingBalance: 0,
    vehiclesFinanced: 3,
    paidOffDate: '2024-04-01'
  }
];

export const mockVehicles = [
  {
    id: 'vehicle_001',
    vin: '1HGBH41JXMN109186',
    make: 'Honda',
    model: 'Accord',
    year: 2023,
    mileage: 12500,
    color: 'Silver',
    price: 28500,
    status: 'on_lot',
    nfcTagId: 'nfc_001',
    nftTokenId: 'nft_001',
    loanId: 'loan_001',
    lastAudit: '2024-06-15T10:30:00Z',
    gpsLocation: { lat: 34.0522, lng: -118.2437 },
    images: ['/api/placeholder/400/300'],
    ipfsHash: 'QmX8J9K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D'
  },
  {
    id: 'vehicle_002',
    vin: '2HGBH41JXMN109187',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    mileage: 8200,
    color: 'Blue',
    price: 32000,
    status: 'on_lot',
    nfcTagId: 'nfc_002',
    nftTokenId: 'nft_002',
    loanId: 'loan_001',
    lastAudit: '2024-06-14T15:45:00Z',
    gpsLocation: { lat: 34.0522, lng: -118.2437 },
    images: ['/api/placeholder/400/300'],
    ipfsHash: 'QmY9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E'
  },
  {
    id: 'vehicle_003',
    vin: '3HGBH41JXMN109188',
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    mileage: 15600,
    color: 'Black',
    price: 45000,
    status: 'sold',
    nfcTagId: 'nfc_003',
    nftTokenId: 'nft_003',
    loanId: 'loan_002',
    lastAudit: '2024-06-10T09:15:00Z',
    soldDate: '2024-06-12',
    images: ['/api/placeholder/400/300'],
    ipfsHash: 'QmZ0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F'
  }
];

export const mockAuditLogs = [
  {
    id: 'audit_001',
    vehicleId: 'vehicle_001',
    vin: '1HGBH41JXMN109186',
    timestamp: '2024-06-15T10:30:00Z',
    location: { lat: 34.0522, lng: -118.2437 },
    status: 'compliant',
    auditorWallet: '0x742d35Cc6635C0532925a3b8D40120f4',
    nfcTagScanned: true,
    notes: 'Vehicle on lot, all systems normal'
  },
  {
    id: 'audit_002',
    vehicleId: 'vehicle_002',
    vin: '2HGBH41JXMN109187',
    timestamp: '2024-06-14T15:45:00Z',
    location: { lat: 34.0525, lng: -118.2440 },
    status: 'flagged',
    auditorWallet: '0x742d35Cc6635C0532925a3b8D40120f4',
    nfcTagScanned: true,
    notes: 'Vehicle location slightly off designated area'
  }
];

export const mockTransactions = [
  {
    id: 'tx_001',
    type: 'loan_disbursement',
    amount: 150000,
    currency: 'USDC',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: '2024-01-15T12:00:00Z',
    status: 'confirmed',
    loanId: 'loan_001'
  },
  {
    id: 'tx_002',
    type: 'payment',
    amount: 25000,
    currency: 'USD',
    method: 'ACH',
    timestamp: '2024-03-15T09:30:00Z',
    status: 'confirmed',
    loanId: 'loan_001'
  },
  {
    id: 'tx_003',
    type: 'anvl_reward',
    amount: 500,
    currency: 'ANVL',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: '2024-01-15T12:05:00Z',
    status: 'confirmed'
  }
];

export const mockNotifications = [
  {
    id: 'notif_001',
    type: 'compliance_alert',
    title: 'Vehicle Location Alert',
    message: 'Vehicle VIN 2HGBH41JXMN109187 flagged for location compliance',
    timestamp: '2024-06-14T15:50:00Z',
    read: false,
    severity: 'warning'
  },
  {
    id: 'notif_002',
    type: 'payment_reminder',
    title: 'Payment Due Soon',
    message: 'Loan payment of $25,000 due on July 15th',
    timestamp: '2024-06-10T10:00:00Z',
    read: true,
    severity: 'info'
  }
];
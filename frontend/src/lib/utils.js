import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  const currencyMap = {
    'USDC': 'USD',
    'ANVL': 'USD',
  };
  
  const displayCurrency = currencyMap[currency] || currency;
  
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency,
    }).format(amount);
    
    if (currency === 'ANVL') {
      return formatted.replace('$', 'ANVL ');
    }
    
    return formatted;
  } catch (error) {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    on_lot: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    flagged: 'bg-red-100 text-red-800',
    compliant: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

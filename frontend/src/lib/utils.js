## **3. Update Utils File**

**Modify:** `frontend/src/lib/utils.js`
Action: file_editor view /app/frontend/src/lib/utils.js
Observation: /app/frontend/src/lib/utils.js:
1|import { clsx } from "clsx"
2|import { twMerge } from "tailwind-merge"
3|
4|export function cn(...inputs) {
5|  return twMerge(clsx(inputs))
6|}
7|
8|export function formatCurrency(amount, currency = 'USD') {
9|  // Handle special currency codes
10|  const currencyMap = {
11|    'USDC': 'USD',
12|    'ANVL': 'USD', // Treat ANVL tokens as USD for formatting
13|  };
14|  
15|  const displayCurrency = currencyMap[currency] || currency;
16|  
17|  try {
18|    const formatted = new Intl.NumberFormat('en-US', {
19|      style: 'currency',
20|      currency: displayCurrency,
21|    }).format(amount);
22|    
23|    // If it's ANVL, replace USD symbol with ANVL
24|    if (currency === 'ANVL') {
25|      return formatted.replace('$', 'ANVL ');
26|    }
27|    
28|    return formatted;
29|  } catch (error) {
30|    // Fallback for invalid currency codes
31|    return `${currency} ${amount.toLocaleString()}`;
32|  }
33|}
34|
35|export function formatDate(dateString) {
36|  return new Date(dateString).toLocaleDateString('en-US', {
37|    year: 'numeric',
38|    month: 'short',
39|    day: 'numeric',
40|  });
41|}
42|
43|export function formatDateTime(dateString) {
44|  return new Date(dateString).toLocaleString('en-US', {
45|    year: 'numeric',
46|    month: 'short',
47|    day: 'numeric',
48|    hour: '2-digit',
49|    minute: '2-digit',
50|  });
51|}
52|
53|export function formatPercentage(value) {
54|  return new Intl.NumberFormat('en-US', {
55|    style: 'percent',
56|    minimumFractionDigits: 1,
57|    maximumFractionDigits: 1,
58|  }).format(value / 100);
59|}
60|
61|export function getStatusColor(status) {
62|  const colors = {
63|    active: 'bg-green-100 text-green-800',
64|    paid: 'bg-blue-100 text-blue-800',
65|    overdue: 'bg-red-100 text-red-800',
66|    pending: 'bg-yellow-100 text-yellow-800',
67|    on_lot: 'bg-green-100 text-green-800',
68|    sold: 'bg-blue-100 text-blue-800',
69|    flagged: 'bg-red-100 text-red-800',
70|    compliant: 'bg-green-100 text-green-800',
71|  };
72|  return colors[status] || 'bg-gray-100 text-gray-800';
73|}

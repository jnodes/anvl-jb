import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  DollarSign, 
  Car, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  MapPin,
  CreditCard,
  Coins
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import { dealerAPI } from '../../services/api';

const DashboardOverview = () => {
  const { dealer } = useAuth();
  const [loans, setLoans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!dealer?.id) return;
      
      try {
        setIsLoading(true);
        const [loansRes, vehiclesRes, notificationsRes] = await Promise.all([
          dealerAPI.getDealerLoans(dealer.id),
          dealerAPI.getDealerVehicles(dealer.id),
          dealerAPI.getDealerNotifications(dealer.id)
        ]);

        setLoans(loansRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setNotifications(notificationsRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dealer?.id]);

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.remaining_balance || 0), 0);
  const vehiclesOnLot = vehicles.filter(vehicle => vehicle.status === 'on_lot').length;
  const recentNotifications = notifications.slice(0, 3);

  const stats = [
    {
      title: 'Total Outstanding',
      value: formatCurrency(totalOutstanding, 'USDC'),
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Active Loans',
      value: activeLoans.length,
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Vehicles on Lot',
      value: vehiclesOnLot,
      icon: Car,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'ANVL Tokens',
      value: dealer?.anvl_tokens || 0,
      icon: Coins,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 truncate">Welcome back, {dealer?.name}!</h1>
            <p className="text-blue-100 text-sm lg:text-base">
              Your dealership is performing well. Here's what's happening today.
            </p>
          </div>
          <div className="flex-shrink-0 text-left sm:text-right">
            <div className="text-xs lg:text-sm text-blue-100">Total Loaned</div>
            <div className="text-lg lg:text-xl font-bold">{formatCurrency(dealer?.total_loaned || 0, 'USDC')}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gray-900 border-gray-800 hover:bg-gray-850 transition-all duration-200 ${stat.borderColor}`}>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg flex-shrink-0`}>
                    <stat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-400 mb-1 truncate">{stat.title}</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Loans */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-white text-lg">
              <CreditCard className="h-5 w-5 flex-shrink-0" />
              <span>Active Loans</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Your current financing overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white text-sm lg:text-base truncate">{formatCurrency(loan.amount, loan.currency)}</div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        {loan.vehicles_financed} vehicles • {loan.interest_rate}% APR
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="font-medium text-emerald-400 text-sm lg:text-base">
                        {formatCurrency(loan.remaining_balance, loan.currency)}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        {loan.next_payment_due ? `Due: ${formatDate(loan.next_payment_due)}` : 'No payment due'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activeLoans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active loans
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800">
              Apply for New Loan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-white text-lg">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>Recent Notifications</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Important updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.severity === 'warning' ? 'bg-yellow-500' : 
                      notification.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-white truncate">{notification.title}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
              {recentNotifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent notifications
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full text-sm text-gray-400 hover:text-white hover:bg-gray-800">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-white text-lg">
            <Car className="h-5 w-5 flex-shrink-0" />
            <span>Vehicle Inventory Status</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Real-time status of your financed vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-400">
                {vehicles.filter(v => v.status === 'on_lot').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">On Lot</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-blue-400">
                {vehicles.filter(v => v.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Sold</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-yellow-400">
                {vehicles.filter(v => v.last_audit && 
                  new Date(v.last_audit) < new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Need Audit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
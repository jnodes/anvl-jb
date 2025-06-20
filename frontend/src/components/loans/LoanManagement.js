import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import { dealerAPI } from '../../services/api';

const LoanManagement = () => {
  const { dealer } = useAuth();
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!dealer?.id) return;
      
      try {
        setIsLoading(true);
        const response = await dealerAPI.getDealerLoans(dealer.id);
        setLoans(response.data || []);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [dealer?.id]);

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.remaining_balance || 0), 0);

  const LoanCard = ({ loan }) => {
    const progress = ((loan.amount - (loan.remaining_balance || loan.amount)) / loan.amount) * 100;
    const isOverdue = loan.status === 'active' && loan.next_payment_due && new Date(loan.next_payment_due) < new Date();

    return (
      <Card className={`bg-gray-900 border-gray-800 hover:bg-gray-850 transition-all duration-200 ${
        isOverdue ? 'border-red-500/50 bg-red-900/20' : ''
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white">{formatCurrency(loan.amount, loan.currency)}</CardTitle>
            <Badge className={`${
              loan.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              loan.status === 'paid' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {loan.status}
            </Badge>
          </div>
          <CardDescription className="text-gray-400">
            Loan ID: {loan.id} • {loan.interest_rate}% APR • {loan.term} months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Loan Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Remaining Balance</div>
                <div className="font-semibold text-lg text-emerald-400">
                  {formatCurrency(loan.remaining_balance || 0, loan.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Vehicles Financed</div>
                <div className="font-semibold text-lg text-white">{loan.vehicles_financed}</div>
              </div>
            </div>

            {loan.status === 'active' && (
              <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  {isOverdue ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-400" />
                  )}
                  <span className={`font-medium ${isOverdue ? 'text-red-300' : 'text-blue-300'}`}>
                    {isOverdue ? 'Payment Overdue' : 'Next Payment'}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">
                    {formatCurrency(loan.next_payment_amount || 0, 'USD')}
                  </div>
                  <div className="text-gray-400">
                    {loan.next_payment_due ? `Due: ${formatDate(loan.next_payment_due)}` : 'No payment due'}
                  </div>
                </div>
              </div>
            )}

            {loan.status === 'paid' && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-green-300">Paid in Full</span>
                </div>
                <div className="text-sm text-green-400">
                  {loan.paid_off_date ? `Completed: ${formatDate(loan.paid_off_date)}` : 'Loan completed'}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800">
                View Details
              </Button>
              {loan.status === 'active' && (
                <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Make Payment
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Loan Management</h1>
          <p className="text-gray-400">Track and manage your USDC loans</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Loan
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(totalOutstanding, 'USDC')}
                </p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold text-blue-400">{activeLoans.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Next Payment</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(25000, 'USD')}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Interest Rate</p>
                <p className="text-2xl font-bold text-green-400">9.0%</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Application CTA */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Need Additional Financing?
              </h3>
              <p className="text-gray-300">
                Apply for a new USDC loan in minutes. Get instant access to capital for your inventory.
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0">
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map(loan => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </div>

      {loans.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No loans found</h3>
            <p className="text-gray-400">Apply for your first USDC loan to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Loan Terms Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Loan Terms & Conditions</CardTitle>
          <CardDescription className="text-gray-400">Understanding your ANVL loan terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-white">Standard Terms</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Interest Rate:</strong> 9% Annual Percentage Rate</li>
                <li>• <strong>Flat Fee:</strong> $50 per vehicle financed</li>
                <li>• <strong>Loan Term:</strong> 6 months maximum</li>
                <li>• <strong>Currency:</strong> USDC disbursement</li>
                <li>• <strong>Repayment:</strong> ACH bank transfers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Benefits</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Instant Disbursement:</strong> Funds in your wallet immediately</li>
                <li>• <strong>Early Repayment:</strong> No penalties for paying early</li>
                <li>• <strong>ANVL Rewards:</strong> Earn tokens for using the platform</li>
                <li>• <strong>Real-time Tracking:</strong> Monitor vehicles with NFC/NFT</li>
                <li>• <strong>Flexible Payments:</strong> Multiple payment options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanManagement;
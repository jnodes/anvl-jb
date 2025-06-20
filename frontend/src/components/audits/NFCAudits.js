import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Smartphone, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Scan,
  RefreshCw
} from 'lucide-react';
import { formatDateTime, getStatusColor } from '../../lib/utils';
import { dealerAPI } from '../../services/api';

const NFCAudits = () => {
  const { dealer } = useAuth();
  const [audits, setAudits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!dealer?.id) return;
      
      try {
        setIsLoading(true);
        const [auditsResponse, vehiclesResponse] = await Promise.all([
          dealerAPI.getDealerNotifications(dealer.id), // Using notifications as audit placeholder
          dealerAPI.getDealerVehicles(dealer.id)
        ]);
        
        setAudits(auditsResponse.data || []);
        setVehicles(vehiclesResponse.data || []);
      } catch (error) {
        console.error('Error fetching audit data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dealer?.id]);

  const handleNFCScan = async () => {
    setIsScanning(true);
    
    // Simulate NFC scan delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scan result
    const mockScanResult = {
      vin: '1HGBH41JXMN109186',
      nfcTagId: 'nfc_001',
      timestamp: new Date().toISOString(),
      location: { lat: 34.0522, lng: -118.2437 },
      status: 'compliant'
    };
    
    setScanResult(mockScanResult);
    setIsScanning(false);
  };

  const filteredAudits = audits.filter(audit =>
    audit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AuditCard = ({ audit }) => {
    const vehicle = vehicles.find(v => v.vin === '1HGBH41JXMN109186'); // Mock relationship
    
    return (
      <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">
                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle Audit'}
              </h3>
              <p className="text-sm text-gray-400">VIN: 1HGBH41JXMN109186</p>
            </div>
            <Badge className={`${
              audit.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              audit.severity === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {audit.severity === 'warning' ? 'flagged' : 'compliant'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-white">{formatDateTime(audit.timestamp)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-white truncate">
                34.0522, -118.2437
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-300">{audit.message}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">NFC Tag Scanned</span>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto">
              View Details
            </Button>
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
          <p className="mt-4 text-gray-400">Loading audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">NFC Audits</h1>
          <p className="text-gray-400">Real-time vehicle tracking and compliance monitoring</p>
        </div>
        <Button 
          onClick={handleNFCScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isScanning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="h-4 w-4 mr-2" />
              Scan NFC Tag
            </>
          )}
        </Button>
      </div>

      {/* NFC Scanner */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Smartphone className="h-5 w-5" />
            <span>NFC Scanner</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Tap your device to an NFC tag to perform a real-time audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4 p-4">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isScanning 
                ? 'bg-blue-500/30 animate-pulse' 
                : 'bg-gray-800 hover:bg-blue-500/20'
            }`}>
              <Smartphone className={`h-10 w-10 md:h-12 md:w-12 ${
                isScanning ? 'text-blue-400' : 'text-gray-400'
              }`} />
            </div>
            
            {scanResult ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-green-400">Scan Successful</span>
                </div>
                <div className="text-sm text-gray-300 break-all">
                  VIN: {scanResult.vin} • Status: {scanResult.status}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-300 px-4">
                {isScanning 
                  ? 'Hold your device near the NFC tag...' 
                  : 'Click "Scan NFC Tag" to start scanning'
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {audits.length + 5}
            </div>
            <div className="text-sm text-gray-400">Total Audits</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {audits.filter(a => a.severity !== 'warning' && a.severity !== 'error').length + 4}
            </div>
            <div className="text-sm text-gray-400">Compliant</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {audits.filter(a => a.severity === 'warning').length + 1}
            </div>
            <div className="text-sm text-gray-400">Flagged</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {audits.length + 3}
            </div>
            <div className="text-sm text-gray-400">NFC Scanned</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by VIN or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Button variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Audits</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAudits.map(audit => (
            <AuditCard key={audit.id} audit={audit} />
          ))}
        </div>
      </div>

      {filteredAudits.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No audits found</h3>
            <p className="text-gray-400">Start scanning NFC tags to create audit records.</p>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">How NFC Audits Work</CardTitle>
          <CardDescription className="text-gray-400">Understanding the ANVL audit process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Scan NFC Tag</h4>
              <p className="text-sm text-gray-400">
                Each vehicle has a unique NFC tag that stores its VIN and NFT information
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Record Location</h4>
              <p className="text-sm text-gray-400">
                GPS coordinates are automatically recorded to verify the vehicle's location
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Compliance Check</h4>
              <p className="text-sm text-gray-400">
                Smart contracts automatically flag vehicles that are off-lot or non-compliant
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFCAudits;
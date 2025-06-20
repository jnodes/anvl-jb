import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Car, 
  Search, 
  Plus, 
  MapPin, 
  Calendar,
  DollarSign,
  Smartphone,
  Eye
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import { dealerAPI } from '../../services/api';

const VehicleInventory = () => {
  const { dealer } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!dealer?.id) return;
      
      try {
        setIsLoading(true);
        const response = await dealerAPI.getDealerVehicles(dealer.id);
        setVehicles(response.data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [dealer?.id]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const VehicleCard = ({ vehicle }) => (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-400">VIN: {vehicle.vin}</p>
          </div>
          <Badge className={`${
            vehicle.status === 'on_lot' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            vehicle.status === 'sold' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {vehicle.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-white">{formatCurrency(vehicle.price)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-white">{vehicle.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-white">
              {vehicle.last_audit ? formatDate(vehicle.last_audit) : 'No audit'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-white">
              {vehicle.status === 'on_lot' ? 'On Lot' : 'Sold'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400">NFC Tagged</span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Smartphone className="h-4 w-4 mr-1" />
              Audit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Inventory</h1>
          <p className="text-gray-400">Manage your financed vehicle inventory</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by VIN, make, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Vehicles</SelectItem>
                <SelectItem value="on_lot" className="text-white hover:bg-gray-700">On Lot</SelectItem>
                <SelectItem value="sold" className="text-white hover:bg-gray-700">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {vehicles.filter(v => v.status === 'on_lot').length}
            </div>
            <div className="text-sm text-gray-400">On Lot</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {vehicles.filter(v => v.status === 'sold').length}
            </div>
            <div className="text-sm text-gray-400">Sold</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(vehicles.reduce((sum, v) => sum + v.price, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {vehicles.filter(v => v.nfc_tag_id).length}
            </div>
            <div className="text-sm text-gray-400">NFC Tagged</div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No vehicles found</h3>
            <p className="text-gray-400">Try adjusting your search terms or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleInventory;
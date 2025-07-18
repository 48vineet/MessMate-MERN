// src/components/admin/InventoryManagement.jsx
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ExclamationTriangleIcon,
  TruckIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { 
  AnimatedCard, 
  Button, 
  Badge, 
  Input,
  Modal,
  ProgressBar
} from '../ui';
import { useState } from 'react';

const InventoryManagement = () => {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const inventoryItems = [
    {
      id: 1,
      name: 'Basmati Rice',
      category: 'grains',
      currentStock: 150,
      minStock: 100,
      unit: 'kg',
      price: 80,
      supplier: 'ABC Food Suppliers',
      lastUpdated: '2024-07-17',
      status: 'good'
    },
    {
      id: 2,
      name: 'Toor Dal',
      category: 'pulses',
      currentStock: 45,
      minStock: 50,
      unit: 'kg',
      price: 120,
      supplier: 'XYZ Traders',
      lastUpdated: '2024-07-16',
      status: 'low'
    },
    {
      id: 3,
      name: 'Cooking Oil',
      category: 'oils',
      currentStock: 5,
      minStock: 20,
      unit: 'liters',
      price: 150,
      supplier: 'Oil Masters',
      lastUpdated: '2024-07-15',
      status: 'critical'
    },
    {
      id: 4,
      name: 'Potatoes',
      category: 'vegetables',
      currentStock: 200,
      minStock: 50,
      unit: 'kg',
      price: 25,
      supplier: 'Fresh Veggies Co.',
      lastUpdated: '2024-07-17',
      status: 'good'
    },
    {
      id: 5,
      name: 'Onions',
      category: 'vegetables',
      currentStock: 80,
      minStock: 30,
      unit: 'kg',
      price: 35,
      supplier: 'Fresh Veggies Co.',
      lastUpdated: '2024-07-16',
      status: 'good'
    },
    {
      id: 6,
      name: 'Wheat Flour',
      category: 'grains',
      currentStock: 25,
      minStock: 40,
      unit: 'kg',
      price: 45,
      supplier: 'Grain House',
      lastUpdated: '2024-07-15',
      status: 'low'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'grains', label: 'Grains' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'oils', label: 'Oils & Spices' },
    { value: 'dairy', label: 'Dairy' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'success';
      case 'low': return 'warning';
      case 'critical': return 'danger';
      default: return 'gray';
    }
  };

  const getStockPercentage = (current, min) => {
    return (current / (min * 2)) * 100;
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
  const criticalItems = inventoryItems.filter(item => item.status === 'critical');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Track stock levels and manage suppliers</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                leftIcon={<BellIcon className="h-4 w-4" />}
              >
                Alerts ({lowStockItems.length})
              </Button>
              <Button 
                variant="primary"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setIsAddItemOpen(true)}
              >
                Add Item
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Alert Cards */}
        {criticalItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-800 font-medium">
                  Critical Stock Alert: {criticalItems.length} items need immediate attention
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AnimatedCard className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 mr-4">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.1} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-500 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Items</p>
                <p className="text-2xl font-bold text-gray-900">{criticalItems.length}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 mr-4">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Search and Filter */}
        <AnimatedCard delay={0.4} className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button variant="outline" leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}>
              Filters
            </Button>
          </div>
        </AnimatedCard>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <AnimatedCard key={item.id} delay={0.5 + index * 0.1} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                </div>
                <Badge variant={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <span className="font-medium">{item.currentStock} {item.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Min Stock</span>
                  <span className="font-medium">{item.minStock} {item.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price per {item.unit}</span>
                  <span className="font-medium">₹{item.price}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Stock Level</span>
                    <span className="text-sm font-medium">
                      {Math.round(getStockPercentage(item.currentStock, item.minStock))}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={getStockPercentage(item.currentStock, item.minStock)}
                    color={getStatusColor(item.status)}
                    size="sm"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Supplier: {item.supplier}</p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Update Stock
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  Reorder
                </Button>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Add Item Modal */}
        <Modal
          isOpen={isAddItemOpen}
          onClose={() => setIsAddItemOpen(false)}
          title="Add New Inventory Item"
          size="md"
        >
          <form className="space-y-4">
            <Input
              label="Item Name"
              placeholder="Enter item name"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="grains">Grains</option>
                <option value="pulses">Pulses</option>
                <option value="vegetables">Vegetables</option>
                <option value="oils">Oils & Spices</option>
                <option value="dairy">Dairy</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Stock"
                type="number"
                placeholder="Enter quantity"
                required
              />
              <Input
                label="Unit"
                placeholder="kg, liters, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Stock"
                type="number"
                placeholder="Min quantity"
                required
              />
              <Input
                label="Price per Unit"
                type="number"
                placeholder="Enter price"
                required
              />
            </div>

            <Input
              label="Supplier Name"
              placeholder="Enter supplier name"
              required
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddItemOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary">
                Add Item
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default InventoryManagement;

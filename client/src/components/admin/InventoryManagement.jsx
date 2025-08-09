// src/components/admin/InventoryManagement.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArchiveBoxIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredients',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: 'kg',
    supplierName: '',
    supplierContact: '',
    costPerUnit: '',
    expiryDate: '',
    description: ''
  });

  const categories = [
    { value: 'ingredients', label: 'Ingredients' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'spices', label: 'Spices' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'others', label: 'Others' }
  ];

  const units = ['kg', 'g', 'liter', 'ml', 'pieces', 'packets', 'bottles', 'cans'];

  useEffect(() => {
    fetchInventory();
    fetchLowStockAlerts();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching inventory...');
      const response = await api.get('/inventory');
      console.log('📦 Inventory response:', response.data);
      
      if (response.data.success) {
        // Transform server data to match frontend expectations
        const transformedData = (response.data.data || []).map(item => ({
          _id: item._id,
          name: item.itemName || item.name,
          category: item.category,
          currentStock: item.currentStock,
          minStock: item.minimumStock || item.minStock,
          maxStock: item.maximumStock || item.maxStock,
          unit: item.unit,
          costPerUnit: item.unitPrice || item.costPerUnit,
          supplierName: item.supplier?.name || item.supplierName,
          supplierContact: item.supplier?.phone || item.supplierContact,
          description: item.description,
          expiryDate: item.expiryDate,
          status: item.status
        }));
        
        setInventory(transformedData);
        console.log('✅ Inventory updated:', transformedData.length, 'items');
        console.log('✅ Transformed data:', transformedData);
      } else {
        console.error('❌ API returned success: false:', response.data);
        toast.error('Failed to load inventory');
      }
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch inventory completed');
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await api.get('/inventory/alerts');
      setLowStockItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'low-stock') {
        filtered = filtered.filter(item => item.currentStock <= item.minStock);
      } else if (statusFilter === 'out-of-stock') {
        filtered = filtered.filter(item => item.currentStock === 0);
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter(item => 
          item.expiryDate && new Date(item.expiryDate) < new Date()
        );
      }
    }

    setFilteredInventory(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Transform form data to match server expectations
      const inventoryData = {
        itemName: formData.name,
        itemCode: 'ITEM' + Date.now(), // Generate a unique code
        category: formData.category,
        currentStock: parseInt(formData.currentStock) || 0,
        minimumStock: parseInt(formData.minStock) || 0,
        maximumStock: parseInt(formData.maxStock) || 0,
        reorderLevel: parseInt(formData.minStock) || 0,
        unit: formData.unit,
        unitPrice: parseFloat(formData.costPerUnit) || 0,
        supplier: {
          name: formData.supplierName,
          contactPerson: formData.supplierContact,
          phone: formData.supplierContact
        },
        storage: {
          location: 'Main Storage'
        },
        description: formData.description,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      };

      console.log('Submitting inventory data:', inventoryData);

      if (editingItem) {
        const response = await api.put(`/inventory/${editingItem._id}`, inventoryData);
        console.log('Update response:', response.data);
        toast.success('Item updated successfully');
      } else {
        const response = await api.post('/inventory', inventoryData);
        console.log('Create response:', response.data);
        toast.success('Item added successfully');
      }
      
      fetchInventory();
      fetchLowStockAlerts();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      unit: item.unit,
      supplierName: item.supplierName || '',
      supplierContact: item.supplierContact || '',
      costPerUnit: item.costPerUnit || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      description: item.description || ''
    });
    setShowAddItem(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/inventory/${itemId}`);
      setInventory(prev => prev.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleStockUpdate = async (itemId, newStock) => {
    try {
      await api.post(`/inventory/${itemId}/add-stock`, { quantity: newStock });
      setInventory(prev => prev.map(item =>
        item._id === itemId ? { ...item, currentStock: newStock } : item
      ));
      toast.success('Stock updated successfully');
      fetchLowStockAlerts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ingredients',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unit: 'kg',
      supplierName: '',
      supplierContact: '',
      costPerUnit: '',
      expiryDate: '',
      description: ''
    });
    setEditingItem(null);
    setShowAddItem(false);
  };

  const getStockStatus = (item) => {
    if (item.currentStock === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: XCircleIcon };
    } else if (item.currentStock <= item.minStock) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
    }
  };

  const isExpired = (expiryDate) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ingredients: '🥘',
      vegetables: '🥬',
      fruits: '🍎',
      dairy: '🥛',
      spices: '🌶️',
      grains: '🌾',
      beverages: '🧃',
      others: '📦'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600">Manage your mess inventory and stock levels</p>
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-800">Low Stock Alerts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lowStockItems.slice(0, 6).map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.currentStock} {item.unit} remaining</p>
                    </div>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>

            <button
              onClick={fetchInventory}
              disabled={loading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* Inventory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredInventory.map((item, index) => {
            const stockStatus = getStockStatus(item);
            const IconComponent = stockStatus.icon;
            
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getCategoryIcon(item.category)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Item"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {stockStatus.status}
                  </span>
                </div>

                {/* Stock Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className="font-medium text-gray-900">{item.currentStock} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min Stock:</span>
                    <span className="text-sm text-gray-900">{item.minStock} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Max Stock:</span>
                    <span className="text-sm text-gray-900">{item.maxStock} {item.unit}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.currentStock <= item.minStock ? 'bg-red-500' :
                        item.currentStock <= item.maxStock * 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Cost Per Unit */}
                  {item.costPerUnit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost/Unit:</span>
                      <span className="text-sm font-medium text-green-600">₹{item.costPerUnit}</span>
                    </div>
                  )}

                  {/* Expiry Date */}
                  {item.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expires:</span>
                      <span className={`text-sm font-medium ${
                        isExpired(item.expiryDate) ? 'text-red-600' :
                        isExpiringSoon(item.expiryDate) ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                        {isExpired(item.expiryDate) && ' (Expired)'}
                        {isExpiringSoon(item.expiryDate) && ' (Soon)'}
                      </span>
                    </div>
                  )}

                  {/* Supplier */}
                  {item.supplierName && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">Supplier: {item.supplierName}</p>
                      {item.supplierContact && (
                        <p className="text-xs text-gray-600">{item.supplierContact}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Stock Update */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="New stock"
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newStock = parseFloat(e.target.value);
                          if (newStock >= 0) {
                            handleStockUpdate(item._id, newStock);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        const newStock = parseFloat(input.value);
                        if (newStock >= 0) {
                          handleStockUpdate(item._id, newStock);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredInventory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ArchiveBoxIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No inventory items found</p>
            <button
              onClick={() => setShowAddItem(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Add your first item
            </button>
          </motion.div>
        )}

        {/* Add/Edit Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock *</label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock *</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock *</label>
                    <input
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Contact</label>
                    <input
                      type="text"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit (₹)</label>
                    <input
                      type="number"
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about this item..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;

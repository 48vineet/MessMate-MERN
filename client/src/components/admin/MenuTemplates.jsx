// src/components/admin/MenuTemplates.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const MenuTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mealType: 'breakfast',
    items: [],
    estimatedPrice: '',
    category: 'regular'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/menu/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load menu templates';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', icon: '🍛' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty items
    const validItems = formData.items.filter(item => item.name && item.name.trim() !== '');
    
    if (validItems.length === 0) {
      toast.error('Please add at least one menu item with a name');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      items: validItems,
      estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : undefined
    };

    try {
      if (editingTemplate) {
        await api.put(`/menu/templates/${editingTemplate._id}`, submitData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/menu/templates', submitData);
        toast.success('Template created successfully');
      }
      
      fetchTemplates();
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save template';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      mealType: template.mealType,
      items: template.items || [],
      estimatedPrice: template.estimatedPrice || '',
      category: template.category || 'regular'
    });
    setShowAddTemplate(true);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/menu/templates/${templateId}`);
      setTemplates(prev => prev.filter(template => template._id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    const today = new Date().toISOString().split('T')[0];
    const confirmMessage = `Create today's ${template.mealType} menu from template "${template.name}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Filter out invalid items
      const validItems = template.items.filter(item => 
        item && item.name && item.name.trim() !== ''
      );

      if (validItems.length === 0) {
        toast.error('Template has no valid menu items');
        return;
      }

      const menuData = {
        date: today,
        mealType: template.mealType,
        items: validItems,
        price: template.estimatedPrice ? parseFloat(template.estimatedPrice) : undefined,
        description: `Created from template: ${template.name}`,
        isAvailable: true
      };

      await api.post('/menu/daily', menuData);
      toast.success(`Menu created from template: ${template.name}`);
      
      // Optionally redirect to menu management
      setTimeout(() => {
        window.location.href = '/admin/menu';
      }, 1500);
    } catch (error) {
      console.error('Error using template:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create menu from template';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      mealType: 'breakfast',
      items: [],
      estimatedPrice: '',
      category: 'regular'
    });
    setEditingTemplate(null);
    setShowAddTemplate(false);
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vegetarian': return 'bg-green-100 text-green-800';
      case 'non-vegetarian': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Templates</h1>
              <p className="text-gray-600">Create and manage reusable menu templates</p>
            </div>
            <button
              onClick={() => setShowAddTemplate(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Template
            </button>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getMealIcon(template.mealType)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{template.mealType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Template"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Template"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Category Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Description */}
                {template.description && (
                  <p className="text-gray-600 mb-4">{template.description}</p>
                )}

                {/* Estimated Price */}
                {template.estimatedPrice && (
                  <div className="flex items-center mb-4">
                    <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-lg font-bold text-green-600">₹{template.estimatedPrice}</span>
                    <span className="text-sm text-gray-500 ml-2">(estimated)</span>
                  </div>
                )}

                {/* Menu Items */}
                {template.items && template.items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Items:</h4>
                    {template.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="mr-2">{item.icon || '🍛'}</span>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <p className="text-sm text-gray-500">+{template.items.length - 3} more items</p>
                    )}
                  </div>
                )}

                {/* Use Template Button */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Use Template
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <DocumentDuplicateIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-6">Create your first menu template to get started</p>
            <button
              onClick={() => setShowAddTemplate(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Template
            </button>
          </motion.div>
        )}

        {/* Add/Edit Template Modal */}
        {showAddTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTemplate ? 'Edit Template' : 'Add New Template'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                    <select
                      value={formData.mealType}
                      onChange={(e) => setFormData(prev => ({ ...prev, mealType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non-vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Price (₹)</label>
                    <input
                      type="number"
                      value={formData.estimatedPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Menu Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          placeholder="🍛"
                          value={item.icon}
                          onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
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

export default MenuTemplates; 
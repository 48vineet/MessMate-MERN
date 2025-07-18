// src/components/admin/MenuManagement.jsx
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  AnimatedCard, 
  Button, 
  Badge, 
  Modal,
  Input,
  Tabs,
  TabPanel
} from '../ui';
import { useState } from 'react';

const MenuManagement = () => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState(0);

  const menuData = {
    breakfast: [
      { id: 1, name: 'Poha', price: 25, description: 'Flattened rice with vegetables', available: true },
      { id: 2, name: 'Upma', price: 20, description: 'Semolina breakfast dish', available: true },
      { id: 3, name: 'Idli Sambhar', price: 30, description: 'Steamed rice cakes with lentil soup', available: false }
    ],
    lunch: [
      { id: 4, name: 'Dal Rice', price: 40, description: 'Lentil curry with steamed rice', available: true },
      { id: 5, name: 'Rajma Chawal', price: 45, description: 'Kidney bean curry with rice', available: true },
      { id: 6, name: 'Curd Rice', price: 35, description: 'Yogurt rice with tempering', available: true }
    ],
    dinner: [
      { id: 7, name: 'Roti Sabzi', price: 35, description: 'Flatbread with vegetable curry', available: true },
      { id: 8, name: 'Paratha', price: 40, description: 'Stuffed flatbread', available: true },
      { id: 9, name: 'Khichdi', price: 30, description: 'Mixed rice and lentil dish', available: false }
    ]
  };

  const mealTimes = {
    breakfast: '8:00 AM - 10:00 AM',
    lunch: '12:00 PM - 2:00 PM',
    dinner: '7:00 PM - 9:00 PM'
  };

  const handleAddMenu = () => {
    setIsAddMenuOpen(true);
  };

  const handleDeleteItem = (id) => {
    // Handle delete logic
    console.log('Delete item:', id);
  };

  const handleEditItem = (id) => {
    // Handle edit logic
    console.log('Edit item:', id);
  };

  const renderMenuItem = (item, mealType) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <Badge 
            variant={item.available ? 'success' : 'danger'}
            className="ml-2"
          >
            {item.available ? 'Available' : 'Out of Stock'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditItem(item.id)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-primary-600">₹{item.price}</span>
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {mealTimes[mealType]}
        </div>
      </div>
    </motion.div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
              <p className="text-gray-600">Manage daily menu items and availability</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="primary"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={handleAddMenu}
              >
                Add Menu Item
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Menu Tabs */}
        <AnimatedCard delay={0.2} className="p-6">
          <Tabs defaultTab={activeTab} onChange={setActiveTab}>
            <TabPanel label="Breakfast">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuData.breakfast.map(item => renderMenuItem(item, 'breakfast'))}
              </div>
            </TabPanel>
            
            <TabPanel label="Lunch">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuData.lunch.map(item => renderMenuItem(item, 'lunch'))}
              </div>
            </TabPanel>
            
            <TabPanel label="Dinner">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuData.dinner.map(item => renderMenuItem(item, 'dinner'))}
              </div>
            </TabPanel>
          </Tabs>
        </AnimatedCard>

        {/* Add Menu Modal */}
        <Modal
          isOpen={isAddMenuOpen}
          onClose={() => setIsAddMenuOpen(false)}
          title="Add New Menu Item"
          size="md"
        >
          <form className="space-y-4">
            <Input
              label="Item Name"
              placeholder="Enter menu item name"
              required
            />
            
            <Input
              label="Description"
              placeholder="Enter item description"
              required
            />
            
            <Input
              label="Price (₹)"
              type="number"
              placeholder="Enter price"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="available" className="text-sm text-gray-900">
                Available for today
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddMenuOpen(false)}
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

export default MenuManagement;

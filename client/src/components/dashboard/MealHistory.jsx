// src/components/dashboard/MealHistory.jsx
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon  // ✅ Added missing import
} from '@heroicons/react/24/outline';
import { AnimatedCard, Button, Badge, Input, Avatar } from '../ui';
import { useState } from 'react';

const MealHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mealHistory = [
    {
      id: 1,
      mealName: 'Dal Tadka with Jeera Rice',
      mealType: 'Lunch',
      date: '2025-07-17',
      time: '12:30 PM',
      price: 45,
      rating: 5,
      status: 'completed',
      feedback: 'Excellent taste! Perfect spice level.',
      image: '🍛',
      waiter: 'Raj Kumar',
      nutrition: { calories: 380, protein: '14g' }
    },
    {
      id: 2,
      mealName: 'Poha with Curd',
      mealType: 'Breakfast',
      date: '2025-07-17',
      time: '8:15 AM',
      price: 25,
      rating: 4,
      status: 'completed',
      feedback: 'Good but could be more spicy.',
      image: '🥣',
      waiter: 'Priya Sharma',
      nutrition: { calories: 220, protein: '8g' }
    },
    {
      id: 3,
      mealName: 'Roti with Mixed Vegetables',
      mealType: 'Dinner',
      date: '2025-07-16',
      time: '7:45 PM',
      price: 35,
      rating: 4,
      status: 'completed',
      feedback: 'Fresh vegetables, good quality.',
      image: '🫓',
      waiter: 'Amit Singh',
      nutrition: { calories: 290, protein: '12g' }
    },
    {
      id: 4,
      mealName: 'Rajma Chawal',
      mealType: 'Lunch',
      date: '2025-07-16',
      time: '1:00 PM',
      price: 45,
      rating: 5,
      status: 'completed',
      feedback: 'Amazing! Just like home-cooked.',
      image: '🍚',
      waiter: 'Sunita Devi',
      nutrition: { calories: 420, protein: '16g' }
    },
    {
      id: 5,
      mealName: 'Idli Sambhar',
      mealType: 'Breakfast',
      date: '2025-07-16',
      time: '8:30 AM',
      price: 30,
      rating: 3,
      status: 'cancelled',
      feedback: 'Order was cancelled due to delay.',
      image: '🥟',
      waiter: null,
      nutrition: { calories: 250, protein: '10g' }
    },
    {
      id: 6,
      mealName: 'Chole Bhature',
      mealType: 'Lunch',
      date: '2025-07-15',
      time: '12:15 PM',
      price: 55,
      rating: 5,
      status: 'completed',
      feedback: 'Crispy bhature and flavorful chole!',
      image: '🫓',
      waiter: 'Ravi Kumar',
      nutrition: { calories: 520, protein: '18g' }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredMeals = mealHistory.filter(meal => {
    const matchesFilter = filter === 'all' || meal.mealType.toLowerCase() === filter;
    const matchesSearch = meal.mealName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSpent = mealHistory
    .filter(meal => meal.status === 'completed')
    .reduce((sum, meal) => sum + meal.price, 0);

  const averageRating = mealHistory
    .filter(meal => meal.status === 'completed' && meal.rating)
    .reduce((sum, meal, _, arr) => sum + meal.rating / arr.length, 0);

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Meal History</h3>
          <p className="text-sm text-gray-600">Your recent dining experience</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info" className="text-xs">
            ₹{totalSpent} spent
          </Badge>
          <Badge variant="warning" className="text-xs">
            {averageRating.toFixed(1)} ⭐ avg
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            size="sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      {/* Meal List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredMeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No meals found</p>
          </motion.div>
        ) : (
          filteredMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* Meal Image */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                    {meal.image}
                  </div>
                </div>

                {/* Meal Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{meal.mealName}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(meal.status)} className="text-xs">
                        {getStatusIcon(meal.status)}
                        <span className="ml-1">{meal.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {meal.date}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {meal.time}
                    </span>
                    <span className="font-medium text-primary-600">₹{meal.price}</span>
                  </div>

                  {/* Rating */}
                  {meal.rating && meal.status === 'completed' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < meal.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({meal.rating}/5)</span>
                    </div>
                  )}

                  {/* Feedback */}
                  {meal.feedback && (
                    <p className="text-sm text-gray-700 italic mb-2">"{meal.feedback}"</p>
                  )}

                  {/* Additional Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{meal.mealType}</span>
                      <span>{meal.nutrition.calories} cal</span>
                      <span>{meal.nutrition.protein} protein</span>
                    </div>
                    
                    {meal.waiter && (
                      <div className="flex items-center space-x-2">
                        <Avatar name={meal.waiter} size="xs" />
                        <span className="text-xs text-gray-600">{meal.waiter}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-4 border-t border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredMeals.length} of {mealHistory.length} meals
          </div>
          <Button variant="outline" size="sm">
            <FunnelIcon className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </motion.div>
    </AnimatedCard>
  );
};

export default MealHistory;

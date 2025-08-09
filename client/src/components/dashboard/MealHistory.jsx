// src/components/dashboard/MealHistory.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const MealHistory = ({ recentMeals = [], onRefresh }) => {
  const [meals, setMeals] = useState(recentMeals);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Fetch meal history (memoized for stable reference)
  const fetchMealHistory = useCallback(async (currentFilter = filter, currentSearch = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get('/meals/history', {
        params: {
          limit: 20,
          filter: currentFilter,
          search: currentSearch
        }
      });
      setMeals(response.data.meals || []);
    } catch (error) {
      // Provide detailed error output
      console.error('Error fetching meal history:', error);
      if (error.response && error.response.status === 404) {
        toast.error('API route /meals/history not found. Please contact support.');
      } else {
        toast.error('Failed to load meal history');
      }
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent recreation

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (!recentMeals || recentMeals.length === 0) {
        fetchMealHistory(filter, value);
      }
    }, 500); // 500ms delay
  };

  // Handle filter change with debounce
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced filter
    searchTimeoutRef.current = setTimeout(() => {
      if (!recentMeals || recentMeals.length === 0) {
        fetchMealHistory(value, searchTerm);
      }
    }, 300); // 300ms delay for filter changes
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Load meals on mount only once
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      if (!recentMeals || recentMeals.length === 0) {
        fetchMealHistory();
      } else {
        setMeals(recentMeals);
      }
    }
  }, []); // Empty dependency array - runs only once

  // Update meals when recentMeals prop changes (but don't fetch again)
  useEffect(() => {
    if (recentMeals && recentMeals.length > 0) {
      setMeals(recentMeals);
    }
  }, [recentMeals]);

  // Call when user clicks Apply or Load More
  const handleManualFetch = () => {
    fetchMealHistory(filter, searchTerm);
  };

  const handleRateMeal = async (mealId, rating) => {
    try {
      await api.post(`/meals/${mealId}/rate`, { rating });
      toast.success('Rating submitted successfully!');
      setMeals(prev => prev.map(meal =>
        meal._id === mealId ? { ...meal, userRating: rating } : meal
      ));
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'no-show': return 'warning';
      default: return 'gray';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getMealIcon = mealType => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesFilter = filter === 'all' || (meal.mealType && meal.mealType.toLowerCase() === filter);
    const matchesSearch = meal.mealName && meal.mealName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSpent = meals
    .filter(meal => meal.status === 'completed')
    .reduce((sum, meal) => sum + (meal.price || 0), 0);

  const completedWithRating = meals.filter(meal => meal.status === 'completed' && meal.userRating);
  const averageRating = completedWithRating.length
    ? completedWithRating.reduce((sum, m) => sum + m.userRating, 0) / completedWithRating.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Meal History</h3>
            <p className="text-sm text-gray-600">Your recent dining experience</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              ₹{totalSpent} spent • {averageRating.toFixed(1)} ⭐ avg
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meals..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            <button
              onClick={handleManualFetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Apply
            </button>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium mb-1">No meals found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredMeals.slice(0, 5).map((meal, index) => (
              <motion.div
                key={meal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-3">
                  {/* Meal Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {getMealIcon(meal.mealType)}
                    </div>
                  </div>

                  {/* Meal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate text-sm">
                        {meal.mealName || `${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} Meal`}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(meal.status) === 'success' ? 'text-green-600 bg-green-100' :
                          getStatusColor(meal.status) === 'danger' ? 'text-red-600 bg-red-100' :
                          getStatusColor(meal.status) === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {getStatusIcon(meal.status)}
                          <span className="ml-1 capitalize">{meal.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-600 mb-1">
                      <span className="flex items-center">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        {meal.date ? new Date(meal.date).toLocaleDateString('en-IN') : ''}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {meal.bookedAt
                          ? new Date(meal.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {meal.price && (
                        <span className="font-medium text-green-600">₹{meal.price}</span>
                      )}
                    </div>

                    {/* Rating */}
                    {meal.status === 'completed' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-600">Rate:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateMeal(meal._id, star)}
                              className="transition-colors"
                            >
                              <StarIcon
                                className={`h-3 w-3 ${
                                  star <= (meal.userRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 hover:text-yellow-400'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {meal.userRating && (
                          <span className="text-xs text-gray-600">({meal.userRating}/5)</span>
                        )}
                      </div>
                    )}

                    {/* Feedback */}
                    {meal.feedback && (
                      <p className="text-xs text-gray-700 italic bg-gray-50 p-2 rounded">
                        "{meal.feedback}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Show more meals link if there are more than 5 */}
            {filteredMeals.length > 5 && (
              <div className="text-center pt-2">
                <button
                  onClick={handleManualFetch}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {filteredMeals.length} meals
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MealHistory;

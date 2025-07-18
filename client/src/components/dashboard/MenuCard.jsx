// components/dashboard/MenuCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { useBooking } from '../../hooks/useBooking';
import { useModal } from '../../hooks/useModal';
import { Button, Badge, LoadingSpinner } from '../ui';
import { UPIPayment } from '../payments';
import { ClockIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';

const MenuCard = ({ 
  todayMenu = null, 
  compact = false, 
  showBookButton = true,
  mealType = null 
}) => {
  const { 
    menuItems, 
    fetchMenuItems,
    getMenuByMealType,
    loading 
  } = useMenu();
  
  const { createBooking, loading: bookingLoading } = useBooking();
  const { isOpen, data, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState(mealType || 'breakfast');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    if (!todayMenu && !mealType) {
      fetchMenuItems();
    }
  }, [fetchMenuItems, todayMenu, mealType]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('messmate-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const handleBookMeal = async (menuItem, quantity = 1) => {
    try {
      const bookingData = {
        menuItem: menuItem._id,
        quantity,
        bookingDate: new Date().toISOString().split('T')[0],
        mealTime: getMealTime(menuItem.mealType),
        specialRequests: ''
      };

      const booking = await createBooking(bookingData);
      
      // Open payment modal with booking details
      openModal({
        amount: booking.finalAmount,
        orderId: booking.bookingId,
        booking,
        menuItem
      });
      
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('messmate-favorites', JSON.stringify([...newFavorites]));
  };

  const getMealTime = (mealType) => {
    const times = {
      breakfast: '08:00 AM',
      lunch: '12:30 PM',
      dinner: '07:30 PM',
      snacks: '04:00 PM'
    };
    return times[mealType] || '12:00 PM';
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const currentMealItems = todayMenu 
    ? (todayMenu[activeTab] || [])
    : getMenuByMealType(activeTab);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {compact ? "Today's Menu" : "Available Meals"} 🍽️
            </h2>
            <p className="text-gray-600 mt-1">
              Fresh meals prepared daily with love
            </p>
          </div>
          
          {!compact && (
            <div className="text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Meal Type Tabs */}
      {!mealType && (
        <div className="px-6 pt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="p-6">
        {currentMealItems.length > 0 ? (
          <div className={`grid gap-4 ${
            compact 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {currentMealItems.slice(0, compact ? 4 : currentMealItems.length).map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(item._id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <HeartIcon 
                    className={`w-5 h-5 ${
                      favorites.has(item._id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>

                {/* Item Image/Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-8">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {item.images?.[0] || '🍽️'}
                  </div>
                </div>

                {/* Price and Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-green-600">
                      ₹{item.effectivePrice || item.price}
                    </span>
                    {item.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                  
                  {item.ratings?.average && (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {item.ratings.average.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.ratings.count})
                      </span>
                    </div>
                  )}
                </div>

                {/* Dietary Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {item.dietary?.isVegetarian && (
                      <Badge variant="success" className="text-xs">
                        🌱 Veg
                      </Badge>
                    )}
                    {item.dietary?.isVegan && (
                      <Badge variant="success" className="text-xs">
                        🌿 Vegan
                      </Badge>
                    )}
                  </div>
                  
                  <Badge
                    variant={item.isAvailable ? 'success' : 'danger'}
                    className="text-xs"
                  >
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </Badge>
                </div>

                {/* Book Button */}
                {showBookButton && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleBookMeal(item)}
                    disabled={!item.isAvailable || bookingLoading}
                    loading={bookingLoading}
                    className="w-full"
                  >
                    {item.isAvailable ? 'Book Now' : 'Not Available'}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🍽️</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No meals available
            </h3>
            <p className="text-gray-600">
              No {activeTab} items are currently available for today
            </p>
          </div>
        )}

        {/* Show More Button (for compact view) */}
        {compact && currentMealItems.length > 4 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => window.location.href = '/menu'}>
              View All Menu Items
            </Button>
          </div>
        )}
      </div>

      {/* UPI Payment Modal */}
      <UPIPayment
        isOpen={isOpen}
        onClose={closeModal}
        amount={data?.amount}
        orderId={data?.orderId}
        customerName={data?.booking?.user?.name}
        onPaymentSuccess={(paymentData) => {
          console.log('Payment successful:', paymentData);
          closeModal();
          // Show success message or redirect
        }}
      />
    </div>
  );
};

export default MenuCard;

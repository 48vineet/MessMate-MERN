import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({
    menus: [],
    bookings: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      // Search in multiple endpoints
      const [menuResponse, bookingResponse] = await Promise.allSettled([
        api.get(`/menu/search?q=${encodeURIComponent(searchQuery)}`),
        api.get(`/bookings/search?q=${encodeURIComponent(searchQuery)}`)
      ]);

      const searchResults = {
        menus: menuResponse.status === 'fulfilled' ? menuResponse.value.data.menus || [] : [],
        bookings: bookingResponse.status === 'fulfilled' ? bookingResponse.value.data.bookings || [] : [],
        users: []
      };

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    return results.menus.length + results.bookings.length + results.users.length;
  };

  const renderMenuResults = () => (
    <div className="space-y-4">
      {results.menus.map((menu) => (
        <motion.div
          key={menu._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {menu.date ? new Date(menu.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Menu'}
              </h3>
              <div className="space-y-2">
                {menu.meals?.map((meal, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="font-medium capitalize mr-2">{meal.type}:</span>
                    <span>{meal.items?.join(', ') || 'No items'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="flex items-center text-sm text-gray-500">
                <StarIcon className="h-4 w-4 mr-1" />
                <span>{menu.rating || 0}/5</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBookingResults = () => (
    <div className="space-y-4">
      {results.bookings.map((booking) => (
        <motion.div
          key={booking._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Booking #{booking.bookingId}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span className="capitalize">{booking.mealType}</span>
                </div>
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                  <span>₹{booking.amount}</span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderNoResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <NoSymbolIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
      <p className="text-gray-500">
        Try searching with different keywords or check your spelling.
      </p>
    </motion.div>
  );

  const tabs = [
    { id: 'all', name: 'All', count: getTotalResults() },
    { id: 'menus', name: 'Menus', count: results.menus.length },
    { id: 'bookings', name: 'Bookings', count: results.bookings.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
              <p className="text-gray-600">
                {query ? `Searching for "${query}"` : 'Enter a search term'}
              </p>
            </div>
          </div>

          {/* Search Stats */}
          {query && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-medium">{tab.name}</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {loading ? 'Searching...' : `${getTotalResults()} results found`}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : query ? (
          <div className="space-y-6">
            {/* All Results */}
            {activeTab === 'all' && (
              <>
                {results.menus.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Menus</h2>
                    {renderMenuResults()}
                  </div>
                )}
                {results.bookings.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings</h2>
                    {renderBookingResults()}
                  </div>
                )}
                {getTotalResults() === 0 && renderNoResults()}
              </>
            )}

            {/* Menu Results */}
            {activeTab === 'menus' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Menus</h2>
                {results.menus.length > 0 ? renderMenuResults() : renderNoResults()}
              </div>
            )}

            {/* Booking Results */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings</h2>
                {results.bookings.length > 0 ? renderBookingResults() : renderNoResults()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-500">
              Use the search bar in the header to find menus, bookings, and more.
            </p>
          </div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage; 
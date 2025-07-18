// src/components/common/SearchBar.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,  // ✅ Fixed - was TrendingUpIcon
  TagIcon
} from '@heroicons/react/24/outline';
import { Input, Badge } from '../ui';
import { useState, useEffect, useRef } from 'react';

const SearchBar = ({ 
  placeholder = "Search meals, bookings...", 
  onSearch, 
  suggestions = [],
  showSuggestions = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Dal Rice',
    'Lunch booking',
    'Breakfast menu',
    'Roti Sabzi'
  ]);
  
  const searchRef = useRef(null);

  const popularSearches = [
    'Today\'s Menu',
    'Breakfast Special',
    'Lunch Combo',
    'Dinner Options',
    'Vegetarian Meals'
  ];

  const mockResults = [
    {
      id: 1,
      type: 'meal',
      title: 'Dal Tadka with Jeera Rice',
      subtitle: 'Lunch • Available Now',
      price: '₹45',
      rating: 4.5,
      image: '🍛'
    },
    {
      id: 2,
      type: 'meal',
      title: 'Poha with Curd',
      subtitle: 'Breakfast • Tomorrow',
      price: '₹25',
      rating: 4.2,
      image: '🥣'
    },
    {
      id: 3,
      type: 'booking',
      title: 'Your Lunch Booking',
      subtitle: 'Today at 12:30 PM',
      status: 'confirmed',
      image: '📅'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        // Simulate search API call
        const filteredResults = mockResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredResults);
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [finalQuery, ...prev.filter(item => item !== finalQuery)];
        return updated.slice(0, 5);
      });
      
      if (onSearch) {
        onSearch(finalQuery);
      }
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'meal':
        return '🍽️';
      case 'booking':
        return '📅';
      default:
        return '📄';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
          rightIcon={
            query && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )
          }
          className="w-full"
        />
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : (
              <div className="py-2">
                {query && results.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
                    {results.map((result) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleSearch(result.title)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-2xl">{result.image}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{result.title}</p>
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.price && (
                            <Badge variant="primary" className="text-xs">
                              {result.price}
                            </Badge>
                          )}
                          {result.status && (
                            <Badge 
                              variant={result.status === 'confirmed' ? 'success' : 'warning'}
                              className="text-xs"
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {query && results.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No results found for "{query}"</p>
                  </div>
                )}

                {!query && (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Recent Searches
                        </h3>
                        {recentSearches.map((search, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleSearch(search)}
                            className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{search}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        Popular Searches
                      </h3>
                      {popularSearches.map((search, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleSearch(search)}
                          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{search}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

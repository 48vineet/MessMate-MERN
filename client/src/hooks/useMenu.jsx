// src/hooks/useMenu.jsx
import { useState, useEffect, useCallback } from 'react';
import { useMenu as useMenuContext } from '../context/MenuContext';
import { toast } from 'react-hot-toast';

const useMenu = () => {
  return useMenuContext();
};

export const useTodayMenu = () => {
  const { fetchTodayMenu, loading, error } = useMenuContext();
  const [todayMenu, setTodayMenu] = useState({});
  const [lastFetch, setLastFetch] = useState(null);

  const refetch = useCallback(async () => {
    try {
      const result = await fetchTodayMenu();
      if (result.success) {
        setTodayMenu(result.menus || {});
        setLastFetch(new Date());
      }
      return result;
    } catch (error) {
      console.error('Error fetching today menu:', error);
      return { success: false, error: error.message };
    }
  }, [fetchTodayMenu]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { todayMenu, loading, error, refetch, lastFetch };
};

export const useMenuSearch = () => {
  const { searchMenus } = useMenuContext();
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const search = useCallback(async (query, filters = {}) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchQuery(query.trim());

    try {
      const result = await searchMenus(query.trim(), filters);
      
      if (result.success) {
        setSearchResults(result.results || []);
      } else {
        setSearchError(result.error || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      setSearchError(error.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchMenus]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setSearchQuery('');
  }, []);

  return { 
    searchResults, 
    searching, 
    searchError, 
    searchQuery,
    search, 
    clearSearch 
  };
};

export const useWeeklyMenu = (startDate) => {
  const { fetchWeeklyMenu } = useMenuContext();
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeekly = useCallback(async (date = startDate) => {
    if (!date) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeeklyMenu(date);
      
      if (result.success) {
        setWeeklyMenus(result.weeklyMenus || []);
      } else {
        setError(result.error || 'Failed to fetch weekly menu');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch weekly menu');
    } finally {
      setLoading(false);
    }
  }, [fetchWeeklyMenu, startDate]);

  useEffect(() => {
    if (startDate) {
      fetchWeekly(startDate);
    }
  }, [fetchWeekly, startDate]);

  return { weeklyMenus, loading, error, refetch: fetchWeekly };
};

export const usePopularItems = () => {
  const { fetchPopularItems } = useMenuContext();
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPopular = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPopularItems();
      
      if (result.success) {
        setPopularItems(result.popularItems || []);
      } else {
        setError(result.error || 'Failed to fetch popular items');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch popular items');
    } finally {
      setLoading(false);
    }
  }, [fetchPopularItems]);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return { popularItems, loading, error, refetch: fetchPopular };
};

export default useMenu;

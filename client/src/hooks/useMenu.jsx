// hooks/useMenu.js
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { useSocket } from './useSocket';
import { useToast } from './useToast';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { menuAPI } = useApi();
  const { onMenuUpdate } = useSocket();
  const { showToast } = useToast();

  // Fetch all menu items
  const fetchMenuItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.getMenuItems(params);
      setMenuItems(response.data || []);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI]);

  // Fetch today's menu
  const fetchTodayMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.getTodayMenu();
      setTodayMenu(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI]);

  // Get single menu item
  const getMenuItem = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.getMenuItem(itemId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI]);

  // Create menu item (Admin only)
  const createMenuItem = useCallback(async (itemData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.createMenuItem(itemData);
      
      if (response.success) {
        setMenuItems(prev => [response.data, ...prev]);
        showToast('Menu item created successfully!', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to create menu item', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI, showToast]);

  // Update menu item (Admin only)
  const updateMenuItem = useCallback(async (itemId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.updateMenuItem(itemId, updateData);
      
      if (response.success) {
        setMenuItems(prev => 
          prev.map(item => 
            item._id === itemId ? { ...item, ...response.data } : item
          )
        );
        
        showToast('Menu item updated successfully!', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to update menu item', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI, showToast]);

  // Delete menu item (Admin only)
  const deleteMenuItem = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.deleteMenuItem(itemId);
      
      if (response.success) {
        setMenuItems(prev => prev.filter(item => item._id !== itemId));
        showToast('Menu item deleted successfully!', 'success');
        return true;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to delete menu item', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [menuAPI, showToast]);

  // Listen for real-time menu updates
  useEffect(() => {
    const cleanup = onMenuUpdate?.((data) => {
      if (data.type === 'availability_update') {
        setMenuItems(prev => 
          prev.map(item => 
            item._id === data.itemId 
              ? { ...item, isAvailable: data.isAvailable, currentQuantity: data.currentQuantity }
              : item
          )
        );
        
        showToast(`Menu updated: ${data.itemName}`, 'info');
      }
    });

    return cleanup;
  }, [onMenuUpdate, showToast]);

  // Helper functions
  const getMenuByMealType = useCallback((mealType) => {
    return menuItems.filter(item => item.mealType === mealType);
  }, [menuItems]);

  const getAvailableItems = useCallback(() => {
    return menuItems.filter(item => item.isAvailable && item.currentQuantity > 0);
  }, [menuItems]);

  const getItemsByCategory = useCallback((category) => {
    return menuItems.filter(item => item.category === category);
  }, [menuItems]);

  const searchItems = useCallback((query) => {
    const searchTerm = query.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm)
      )
    );
  }, [menuItems]);

  const getPopularItems = useCallback(() => {
    return menuItems
      .filter(item => item.stats?.totalOrders > 0)
      .sort((a, b) => (b.stats?.totalOrders || 0) - (a.stats?.totalOrders || 0))
      .slice(0, 10);
  }, [menuItems]);

  const getHighRatedItems = useCallback(() => {
    return menuItems
      .filter(item => (item.ratings?.average || 0) >= 4.0)
      .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
  }, [menuItems]);

  return {
    // State
    menuItems,
    todayMenu,
    loading,
    error,
    
    // Actions
    fetchMenuItems,
    fetchTodayMenu,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    
    // Helper functions
    getMenuByMealType,
    getAvailableItems,
    getItemsByCategory,
    searchItems,
    getPopularItems,
    getHighRatedItems,
    
    // Computed values
    breakfastItems: getMenuByMealType('breakfast'),
    lunchItems: getMenuByMealType('lunch'),
    dinnerItems: getMenuByMealType('dinner'),
    snackItems: getMenuByMealType('snacks'),
    availableItems: getAvailableItems(),
    popularItems: getPopularItems(),
    highRatedItems: getHighRatedItems()
  };
};

export default useMenu;

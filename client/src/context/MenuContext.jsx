// src/context/MenuContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  menus: {},
  currentMenu: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedMealType: 'breakfast',
  loading: false,
  error: null,
  cache: {}
};

// Action types
const MENU_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_MENUS: 'SET_MENUS',
  SET_CURRENT_MENU: 'SET_CURRENT_MENU',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_SELECTED_MEAL_TYPE: 'SET_SELECTED_MEAL_TYPE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_TO_CACHE: 'ADD_TO_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE'
};

// Reducer function
const menuReducer = (state, action) => {
  switch (action.type) {
    case MENU_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case MENU_ACTIONS.SET_MENUS:
      return {
        ...state,
        menus: action.payload,
        loading: false,
        error: null
      };

    case MENU_ACTIONS.SET_CURRENT_MENU:
      return {
        ...state,
        currentMenu: action.payload,
        loading: false,
        error: null
      };

    case MENU_ACTIONS.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };

    case MENU_ACTIONS.SET_SELECTED_MEAL_TYPE:
      return {
        ...state,
        selectedMealType: action.payload
      };

    case MENU_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case MENU_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case MENU_ACTIONS.ADD_TO_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now()
          }
        }
      };

    case MENU_ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        cache: {}
      };

    default:
      return state;
  }
};

// Create context
const MenuContext = createContext();

// Menu Provider component
export const MenuProvider = ({ children }) => {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if cached data is still valid
  const isCacheValid = (cacheKey) => {
    const cached = state.cache[cacheKey];
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  };

  // Get cached data
  const getCachedData = (cacheKey) => {
    return state.cache[cacheKey]?.data;
  };

  // Add data to cache
  const addToCache = (cacheKey, data) => {
    dispatch({
      type: MENU_ACTIONS.ADD_TO_CACHE,
      payload: { key: cacheKey, data }
    });
  };

  // Fetch menu for a specific date
  const fetchMenuByDate = useCallback(async (date) => {
    const cacheKey = `menu_${date}`;
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      dispatch({ type: MENU_ACTIONS.SET_MENUS, payload: cachedData });
      return { success: true, menus: cachedData };
    }

    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });

      const response = await api.get(`/menu/date/${date}`);
      
      if (response.data.success) {
        const menus = response.data.menus || {};
        
        dispatch({ type: MENU_ACTIONS.SET_MENUS, payload: menus });
        addToCache(cacheKey, menus);
        
        return { success: true, menus };
      } else {
        throw new Error(response.data.message || 'Failed to fetch menu');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch menu';
      
      dispatch({ type: MENU_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.cache]);

  // Fetch today's menu
  const fetchTodayMenu = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return await fetchMenuByDate(today);
  }, [fetchMenuByDate]);

  // Fetch menu for specific meal type and date
  const fetchSpecificMenu = useCallback(async (date, mealType) => {
    const cacheKey = `menu_${date}_${mealType}`;
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      dispatch({ type: MENU_ACTIONS.SET_CURRENT_MENU, payload: cachedData });
      return { success: true, menu: cachedData };
    }

    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });

      const response = await api.get(`/menu/${date}/${mealType}`);
      
      if (response.data.success) {
        const menu = response.data.menu;
        
        dispatch({ type: MENU_ACTIONS.SET_CURRENT_MENU, payload: menu });
        addToCache(cacheKey, menu);
        
        return { success: true, menu };
      } else {
        throw new Error(response.data.message || 'Failed to fetch menu');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch menu';
      
      dispatch({ type: MENU_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.cache]);

  // Get menu for the week
  const fetchWeeklyMenu = useCallback(async (startDate) => {
    const cacheKey = `weekly_menu_${startDate}`;
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      return { success: true, weeklyMenus: cachedData };
    }

    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });

      const response = await api.get(`/menu/week/${startDate}`);
      
      if (response.data.success) {
        const weeklyMenus = response.data.weeklyMenus || [];
        
        addToCache(cacheKey, weeklyMenus);
        
        return { success: true, weeklyMenus };
      } else {
        throw new Error(response.data.message || 'Failed to fetch weekly menu');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch weekly menu';
      
      dispatch({ type: MENU_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.cache]);

  // Search menus
  const searchMenus = useCallback(async (query, filters = {}) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });

      const response = await api.get('/menu/search', {
        params: { q: query, ...filters }
      });
      
      if (response.data.success) {
        return { success: true, results: response.data.results || [] };
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Search failed';
      
      dispatch({ type: MENU_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Get popular menu items
  const fetchPopularItems = useCallback(async () => {
    const cacheKey = 'popular_items';
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      return { success: true, popularItems: cachedData };
    }

    try {
      const response = await api.get('/menu/popular');
      
      if (response.data.success) {
        const popularItems = response.data.popularItems || [];
        
        addToCache(cacheKey, popularItems);
        
        return { success: true, popularItems };
      } else {
        throw new Error(response.data.message || 'Failed to fetch popular items');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch popular items';
      return { success: false, error: errorMessage };
    }
  }, [state.cache]);

  // Set selected date
  const setSelectedDate = (date) => {
    dispatch({ type: MENU_ACTIONS.SET_SELECTED_DATE, payload: date });
  };

  // Set selected meal type
  const setSelectedMealType = (mealType) => {
    dispatch({ type: MENU_ACTIONS.SET_SELECTED_MEAL_TYPE, payload: mealType });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });
  };

  // Clear cache
  const clearCache = () => {
    dispatch({ type: MENU_ACTIONS.CLEAR_CACHE });
  };

  // Get current selected menu
  const getCurrentMenu = () => {
    const { selectedDate, selectedMealType, menus } = state;
    return menus[selectedDate]?.[selectedMealType] || null;
  };

  const value = {
    // State
    menus: state.menus,
    currentMenu: state.currentMenu,
    selectedDate: state.selectedDate,
    selectedMealType: state.selectedMealType,
    loading: state.loading,
    error: state.error,
    
    // Actions
    fetchMenuByDate,
    fetchTodayMenu,
    fetchSpecificMenu,
    fetchWeeklyMenu,
    searchMenus,
    fetchPopularItems,
    setSelectedDate,
    setSelectedMealType,
    clearError,
    clearCache,
    getCurrentMenu
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

// Custom hook to use menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  
  return context;
};

export default MenuContext;

// src/hooks/useApi.jsx
import { useState, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api(config);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (url, config = {}) => {
    return request({ method: 'GET', url, ...config });
  }, [request]);

  const post = useCallback(async (url, data, config = {}) => {
    return request({ method: 'POST', url, data, ...config });
  }, [request]);

  const put = useCallback(async (url, data, config = {}) => {
    return request({ method: 'PUT', url, data, ...config });
  }, [request]);

  const patch = useCallback(async (url, data, config = {}) => {
    return request({ method: 'PATCH', url, data, ...config });
  }, [request]);

  const del = useCallback(async (url, config = {}) => {
    return request({ method: 'DELETE', url, ...config });
  }, [request]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError
  };
};

export const useLazyApi = () => {
  const { request, loading, error, clearError } = useApi();
  
  const execute = useCallback(async (config, options = {}) => {
    const { showSuccessToast = false, showErrorToast = true, successMessage = 'Success!' } = options;
    
    const result = await request(config);
    
    if (result.success && showSuccessToast) {
      toast.success(successMessage);
    } else if (!result.success && showErrorToast) {
      toast.error(result.error);
    }
    
    return result;
  }, [request]);

  return { execute, loading, error, clearError };
};

export default useApi;

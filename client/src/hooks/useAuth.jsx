// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const useAuth = () => {
  return useAuthContext();
};

export const useAuthRedirect = (redirectTo = '/dashboard') => {
  const { isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setShouldRedirect(true);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, redirectTo, navigate]);

  return { shouldRedirect, isAuthenticated, loading };
};

export const useProtectedRoute = (redirectTo = '/login') => {
  const { isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShouldRedirect(true);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, redirectTo, navigate]);

  return { shouldRedirect, isAuthenticated, loading };
};

export const useLogin = () => {
  const { login } = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = useCallback(async (credentials) => {
    setLoginLoading(true);
    try {
      const result = await login(credentials);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        toast.error(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoginLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, loginLoading };
};

export const useLogout = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setLogoutLoading(false);
    }
  }, [logout, navigate]);

  return { handleLogout, logoutLoading };
};

export default useAuth;

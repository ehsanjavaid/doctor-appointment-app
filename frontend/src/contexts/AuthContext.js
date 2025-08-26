import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
    navigate('/');
  }, [dispatch, navigate]);

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);


  // Auto logout after 1 hour of inactivity
  useEffect(() => {
    const handleActivity = () => {
      clearTimeout(logoutTimer);
      setLogoutTimer(setTimeout(logout, 60 * 60 * 1000)); // 1 hour
    };

    const timer = setTimeout(logout, 60 * 60 * 1000); // 1 hour

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [logout, logoutTimer]);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token && !state.user) {
        try {
          const response = await api.get('/api/auth/me');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: state.token
            }
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }
    };

    checkAuth();
  }, [state.token, state.user]);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      toast.success('Login successful!');
      
      // Redirect based on user role - this should be handled by the component that calls login
      // The navigation should happen in the component, not in the context
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // OAuth login function
  const oauthLogin = async (token) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // Store the token first
      localStorage.setItem('token', token);
      
      // Fetch user data using the token
      const response = await api.get('/api/auth/me');

      const user = response.data.user;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'OAuth login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post('/api/auth/register', userData);

      const { user, token } = response.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      toast.success('Registration successful! Please check your email for verification.');
      
      // Return user data - navigation should be handled by the component
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await api.put(`/api/users/${state.user._id}`, userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.data
      });

      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password: newPassword
      });

      toast.success('Password reset successful');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user is verified
  const isVerified = () => {
    return state.user?.isVerified;
  };

  const value = {
    ...state,
    login,
    oauthLogin,
    register,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasRole,
    hasAnyRole,
    isVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

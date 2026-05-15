import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api',
  withCredentials: true,
}); 

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
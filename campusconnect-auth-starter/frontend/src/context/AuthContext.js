import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    api.get('/me')
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload, isAdmin = false) => {
    const url = isAdmin ? '/admin-login' : '/login';
    const response = await api.post(url, payload);
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

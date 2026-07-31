import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    // Mock login
    await new Promise((r) => setTimeout(r, 1000));
    if (email && password) {
      const userData = { id: '1', name: 'Kabir', email, role: 'Admin', avatar: null };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: 'Invalid credentials' };
  };

  const register = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const userData = { id: '1', name: data.name, email: data.email, role: 'Admin', avatar: null };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

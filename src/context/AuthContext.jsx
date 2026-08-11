import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await loginUser(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));

        return {
          success: true,
          user: response.user,
        };
      }

      return {
        success: false,
        error: response.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        error: error.message || 'Unable to connect to backend',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);

      const response = await registerUser(
        data.name,
        data.email,
        data.password
      );

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));

        return {
          success: true,
          user: response.user,
        };
      }

      return {
        success: false,
        error: response.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        error: error.message || 'Unable to connect to backend',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/store/users';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usuario, contrasena) => {
    try {
      const response = await loginUser(usuario, contrasena);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      
      if (response.success) {
        // Después de registrarse, hacer login automático
        const loginResponse = await login(userData.usuario, userData.contrasena);
        return loginResponse;
      } else {
        return { success: false, message: response.message || 'Error al registrar' };
      }
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const isAdmin = () => {
    const result = user?.rol === 'administrador';
    console.log('🔍 isAdmin() llamado:', { user, rol: user?.rol, result });
    return result;
  };

  const isClient = () => {
    return user?.rol === 'cliente';
  };

  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isClient,
    isAuthenticated: !!user,
  };

  // Log para debugging
  console.log('📊 AuthContext state:', { 
    hasUser: !!user, 
    userRol: user?.rol, 
    isAuthenticated: !!user 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

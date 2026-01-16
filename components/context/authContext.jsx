import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/store/users';
import SecureStorageManager from '../security/SecureStorage';
import SecureLogger from '../security/SecureLogger';

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
  const [authVersion, setAuthVersion] = useState(0); // Para forzar re-renders

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      SecureLogger.debug('Cargando usuario desde almacenamiento seguro');
      
      // Usar almacenamiento seguro en lugar de AsyncStorage
      const userData = await SecureStorageManager.getUser();
      const token = await SecureStorageManager.getToken();
      
      if (userData && token) {
        setUser(userData);
        SecureLogger.success('Usuario cargado exitosamente');
      } else {
        SecureLogger.info('No hay usuario almacenado');
      }
    } catch (error) {
      SecureLogger.error('Error cargando usuario', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usuario, contrasena) => {
    try {
      console.log('🔐 AuthContext: Iniciando proceso de login');
      console.log('🔐 Usuario:', usuario);
      console.log('🔐 Contraseña length:', contrasena?.length);
      
      const response = await loginUser(usuario, contrasena);
      console.log('🔐 Respuesta del servicio loginUser:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        // El backend devuelve { success: true, data: { user: {...}, tokens: {...} } }
        const userData = response.data?.user || response.user;
        const tokens = response.data?.tokens || response.tokens;
        
        console.log('🔐 Datos de usuario extraídos:', JSON.stringify(userData, null, 2));
        console.log('🔐 Tokens extraídos:', tokens ? 'PRESENTES' : 'AUSENTES');
        
        if (tokens?.accessToken) {
          console.log('🔐 Token access (primeros 20 chars):', tokens.accessToken.substring(0, 20));
        }
        
        console.log('🔐 Estableciendo usuario en estado...');
        setUser(userData);
        
        // Incrementar versión para forzar re-render
        setAuthVersion(prev => prev + 1);
        
        console.log('🔐 Estado actualizado, usuario actual:', userData?.nombre, userData?.rol);
        
        // Usar almacenamiento seguro
        console.log('🔐 Guardando usuario en almacenamiento...');
        const userSaved = await SecureStorageManager.setUser(userData);
        console.log('🔐 Usuario guardado:', userSaved);
        
        // Guardar token de forma segura
        if (tokens?.accessToken) {
          console.log('🔐 Guardando token en almacenamiento...');
          const tokenSaved = await SecureStorageManager.setToken(tokens.accessToken);
          console.log('🔐 Token guardado:', tokenSaved);
        } else {
          console.warn('⚠️ No se recibió token del backend');
        }
        
        // Verificar permisos de admin
        const isAdminUser = userData.rol === 'administrador';
        console.log('🔐 Verificación de permisos admin:', {
          rol: userData.rol,
          es_super_admin: userData.es_super_admin,
          isAdmin: isAdminUser
        });
        
        // Debug: Mostrar datos almacenados
        await SecureStorageManager.debugShowAllData();
        
        console.log('✅ Login completado exitosamente');
        console.log('📤 Retornando:', { success: true, user: userData, isAdmin: isAdminUser });
        
        return { success: true, user: userData, isAdmin: isAdminUser };
      } else {
        console.warn('❌ Login falló:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      console.error('💥 Stack:', error.stack);
      return { success: false, message: 'Error al iniciar sesión: ' + error.message };
    }
  };

  const register = async (userData) => {
    try {
      SecureLogger.auth('Iniciando proceso de registro');
      
      const response = await registerUser(userData);
      
      if (response.success) {
        // Después de registrarse, hacer login automático
        const loginResponse = await login(userData.usuario, userData.contrasena);
        return loginResponse;
      } else {
        SecureLogger.warn('Registro falló', { message: response.message });
        return { success: false, message: response.message || 'Error al registrar' };
      }
    } catch (error) {
      SecureLogger.error('Error en register', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      SecureLogger.auth('Iniciando logout');
      
      // Limpiar todos los datos sensibles de forma segura
      await SecureStorageManager.clearAllSecureData();
      setUser(null);
      setAuthVersion(prev => prev + 1); // Forzar re-render
      
      SecureLogger.success('Logout completado - Datos sensibles eliminados');
    } catch (error) {
      SecureLogger.error('Error en logout', error);
    }
  };

  const isAdmin = () => {
    // Permitir acceso a admin si es administrador, independientemente de es_super_admin
    const result = user?.rol === 'administrador';
    console.log('🔐 Verificación isAdmin:', { 
      rol: user?.rol, 
      es_super_admin: user?.es_super_admin,
      result 
    });
    return result;
  };

  const isClient = () => {
    return user?.rol === 'cliente';
  };

  const updateUser = async (userData) => {
    try {
      SecureLogger.debug('Actualizando datos de usuario');
      
      setUser(userData);
      await SecureStorageManager.setUser(userData);
      setAuthVersion(prev => prev + 1); // Forzar re-render
      
      SecureLogger.success('Usuario actualizado en contexto y almacenamiento seguro');
    } catch (error) {
      SecureLogger.error('Error actualizando usuario', error);
    }
  };

  // Refrescar los datos del usuario desde almacenamiento seguro
  const refreshUser = async () => {
    try {
      const userData = await SecureStorageManager.getUser();
      if (userData) {
        setUser(userData);
        setAuthVersion(prev => prev + 1); // Forzar re-render
        SecureLogger.debug('Usuario refrescado desde almacenamiento seguro');
      }
    } catch (error) {
      SecureLogger.error('Error refrescando usuario', error);
    }
  };

  // Verificar si el token sigue siendo válido
  const checkTokenValidity = async () => {
    try {
      const token = await SecureStorageManager.getToken();
      
      if (!token) {
        SecureLogger.warn('No hay token disponible');
        await logout();
        return false;
      }
      
      if (!SecureStorageManager.isTokenValid(token)) {
        SecureLogger.warn('Token expirado, cerrando sesión');
        await logout();
        return false;
      }
      
      return true;
    } catch (error) {
      SecureLogger.error('Error verificando validez del token', error);
      await logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkTokenValidity,
    isAdmin,
    isClient,
    isAuthenticated: !!user,
    authVersion, // Incluir versión para tracking
  };

  // Log de estado (sanitizado)
  SecureLogger.debug('AuthContext state', { 
    hasUser: !!user, 
    userRol: user?.rol, 
    isAuthenticated: !!user 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

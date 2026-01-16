// Sistema de almacenamiento simplificado - Solo AsyncStorage para desarrollo
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG } from '../../config/env.js';

class SecureStorageManager {
  
  // Usar solo AsyncStorage para evitar problemas con expo-secure-store
  static async setSecureItem(key, value) {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      await AsyncStorage.setItem(`secure_${key}`, value);
      
      if (ENV_CONFIG.DEBUG_MODE) {
        console.log(`🔒 Dato almacenado: ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error almacenando dato ${key}:`, error);
      return false;
    }
  }

  // Obtener datos
  static async getSecureItem(key) {
    try {
      const value = await AsyncStorage.getItem(`secure_${key}`);
      
      if (value) {
        if (ENV_CONFIG.DEBUG_MODE) {
          console.log(`🔓 Dato recuperado: ${key}`);
        }
        
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error(`❌ Error obteniendo dato ${key}:`, error);
      return null;
    }
  }

  // Eliminar datos
  static async removeSecureItem(key) {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
      
      if (ENV_CONFIG.DEBUG_MODE) {
        console.log(`🗑️ Dato eliminado: ${key}`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando dato ${key}:`, error);
      return false;
    }
  }

  // Verificar si un token JWT es válido
  static isTokenValid(token) {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Verificar expiración
      if (payload.exp && payload.exp < currentTime) {
        if (ENV_CONFIG.DEBUG_MODE) {
          console.log('⚠️ Token expirado');
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  }

  // Limpiar todos los datos sensibles
  static async clearAllSecureData() {
    try {
      const keys = ['token', 'user', 'refreshToken', 'biometricData'];
      
      for (const key of keys) {
        await this.removeSecureItem(key);
      }
      
      if (ENV_CONFIG.DEBUG_MODE) {
        console.log('🧹 Todos los datos sensibles eliminados');
      }
      return true;
    } catch (error) {
      console.error('❌ Error limpiando datos sensibles:', error);
      return false;
    }
  }

  // Almacenar token
  static async setToken(token) {
    if (!token) {
      console.error('❌ Token vacío, no se almacenará');
      return false;
    }
    
    // En desarrollo, ser menos estricto con la validación de tokens
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('🔧 Modo debug: Guardando token sin validación estricta');
      const result = await this.setSecureItem('token', token);
      if (result) {
        console.log('✅ Token almacenado correctamente (modo debug)');
      }
      return result;
    }
    
    // En producción, validar el token
    if (!this.isTokenValid(token)) {
      console.error('❌ Token inválido, no se almacenará');
      return false;
    }
    
    const result = await this.setSecureItem('token', token);
    if (result && ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ Token almacenado correctamente');
    }
    return result;
  }

  // Obtener token
  static async getToken() {
    const token = await this.getSecureItem('token');
    
    if (!token) {
      if (ENV_CONFIG.DEBUG_MODE) {
        console.log('⚠️ No hay token almacenado');
      }
      return null;
    }
    
    // En desarrollo, ser menos estricto con la validación
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('🔧 Modo debug: Retornando token sin validación estricta');
      console.log('✅ Token recuperado (modo debug)');
      return token;
    }
    
    // En producción, validar el token
    if (!this.isTokenValid(token)) {
      if (ENV_CONFIG.DEBUG_MODE) {
        console.log('⚠️ Token expirado encontrado, eliminando...');
      }
      await this.removeSecureItem('token');
      return null;
    }
    
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ Token válido recuperado');
    }
    
    return token;
  }

  // Almacenar datos de usuario
  static async setUser(userData) {
    if (!userData) {
      console.error('❌ Datos de usuario vacíos');
      return false;
    }
    
    // Remover datos sensibles antes de almacenar
    const safeUserData = { ...userData };
    delete safeUserData.password;
    delete safeUserData.contrasena;
    delete safeUserData.password_hash;
    
    const result = await this.setSecureItem('user', safeUserData);
    if (result && ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ Usuario almacenado correctamente');
    }
    return result;
  }

  // Obtener datos de usuario
  static async getUser() {
    const user = await this.getSecureItem('user');
    if (user && ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ Usuario recuperado correctamente');
    }
    return user;
  }

  // Debug: Mostrar todos los datos almacenados
  static async debugShowAllData() {
    if (!ENV_CONFIG.DEBUG_MODE) return;
    
    try {
      console.log('🔍 DEBUG: Datos almacenados:');
      
      const token = await this.getSecureItem('token');
      const user = await this.getSecureItem('user');
      
      console.log('  Token:', token ? 'PRESENTE' : 'AUSENTE');
      console.log('  Usuario:', user ? JSON.stringify(user, null, 2) : 'AUSENTE');
      
      // Mostrar todas las claves de AsyncStorage que empiecen con 'secure_'
      const allKeys = await AsyncStorage.getAllKeys();
      const secureKeys = allKeys.filter(key => key.startsWith('secure_'));
      console.log('  Claves seguras:', secureKeys);
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
    }
  }
}

export default SecureStorageManager;
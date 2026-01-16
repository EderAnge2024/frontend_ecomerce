import BASE_URL from '../apiEcomerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureHttpClient from '../../security/SecureHttpClient';
import SecureLogger from '../../security/SecureLogger';
import InputValidator from '../../security/InputValidator';

// ============ CRUD TOKENS ============

export const createToken = async (tokenData) => {
  try {
    // Validar datos de entrada
    if (!tokenData || typeof tokenData !== 'object') {
      throw new Error('Datos de token inválidos');
    }

    // Sanitizar datos sensibles para logs
    SecureLogger.info('Creando token');
    
    const response = await SecureHttpClient.post(`${BASE_URL}/tokens`, tokenData);
    const data = await response.json();
    
    SecureLogger.success('Token creado exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en createToken', error);
    throw error;
  }
};

export const getAllTokens = async () => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🔑 Obteniendo todos los tokens');
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/tokens`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en getAllTokens:', error);
    throw error;
  }
};

export const getTokenById = async (id) => {
  try {
    // Validar ID
    const validation = InputValidator.validateInput(id?.toString(), 'text');
    if (!validation.isValid) {
      throw new Error('ID de token inválido');
    }

    SecureLogger.info('Obteniendo token por ID');
    
    const response = await SecureHttpClient.get(`${BASE_URL}/tokens/${validation.sanitized}`);
    const data = await response.json();
    
    SecureLogger.success('Token obtenido exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en getTokenById', error);
    throw error;
  }
};

export const getTokensByUser = async (id_usuario) => {
  try {
    // Validar ID de usuario
    const validation = InputValidator.validateInput(id_usuario?.toString(), 'text');
    if (!validation.isValid) {
      throw new Error('ID de usuario inválido');
    }

    SecureLogger.info('Obteniendo tokens del usuario');
    
    const response = await SecureHttpClient.get(`${BASE_URL}/tokens/usuario/${validation.sanitized}`);
    const data = await response.json();
    
    SecureLogger.success('Tokens del usuario obtenidos exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en getTokensByUser', error);
    throw error;
  }
};

export const updateToken = async (id, tokenData) => {
  try {
    // Validar ID
    const idValidation = InputValidator.validateInput(id?.toString(), 'text');
    if (!idValidation.isValid) {
      throw new Error('ID de token inválido');
    }

    // Validar datos de entrada
    if (!tokenData || typeof tokenData !== 'object') {
      throw new Error('Datos de token inválidos');
    }

    SecureLogger.info('Actualizando token');
    
    const response = await SecureHttpClient.put(`${BASE_URL}/tokens/${idValidation.sanitized}`, tokenData);
    const data = await response.json();
    
    SecureLogger.success('Token actualizado exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en updateToken', error);
    throw error;
  }
};

export const deleteToken = async (id) => {
  try {
    // Validar ID
    const validation = InputValidator.validateInput(id?.toString(), 'text');
    if (!validation.isValid) {
      throw new Error('ID de token inválido');
    }

    SecureLogger.info('Eliminando token');
    
    const response = await SecureHttpClient.delete(`${BASE_URL}/tokens/${validation.sanitized}`);
    const data = await response.json();
    
    SecureLogger.success('Token eliminado exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en deleteToken', error);
    throw error;
  }
};

export const cleanExpiredTokens = async () => {
  try {
    SecureLogger.info('Limpiando tokens expirados');
    
    const response = await SecureHttpClient.delete(`${BASE_URL}/tokens/clean/expired`);
    const data = await response.json();
    
    SecureLogger.success('Tokens expirados limpiados exitosamente');
    return data;
  } catch (error) {
    SecureLogger.error('Error en cleanExpiredTokens', error);
    throw error;
  }
};

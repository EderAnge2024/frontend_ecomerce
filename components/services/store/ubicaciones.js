import BASE_URL from '../apiEcomerce';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ CRUD UBICACIONES ============

export const createUbicacion = async (ubicacionData) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Creando ubicación:', ubicacionData);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/ubicaciones`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ubicacionData),
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en createUbicacion:', error);
    throw error;
  }
};

export const getAllUbicaciones = async () => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Obteniendo todas las ubicaciones');
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/ubicaciones`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en getAllUbicaciones:', error);
    throw error;
  }
};

export const getUbicacionById = async (id) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Obteniendo ubicación por ID:', id);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en getUbicacionById:', error);
    throw error;
  }
};

export const getUbicacionesByUser = async (id_usuario) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Obteniendo ubicaciones del usuario:', id_usuario);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/ubicaciones/usuario/${id_usuario}`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en getUbicacionesByUser:', error);
    throw error;
  }
};

export const updateUbicacion = async (id, ubicacionData) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Actualizando ubicación:', id);
    console.log('🔑 Token disponible:', !!token);
    console.log('📦 Datos:', ubicacionData);
    
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(ubicacionData),
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en updateUbicacion:', error);
    throw error;
  }
};

export const deleteUbicacion = async (id) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📍 Eliminando ubicación:', id);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error en deleteUbicacion:', error);
    throw error;
  }
};

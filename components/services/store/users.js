import SecureHttpClient from '../../security/SecureHttpClient';
import { ENV_CONFIG } from '../../../config/env';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// ============ AUTENTICACIÓN ============

export const registerUser = async (userData) => {
  try {
    console.log('👤 Iniciando registro de usuario');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/register`, userData);
    const data = await response.json();
    
    console.log('✅ Usuario registrado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    throw error;
  }
};

export const loginUser = async (usuario, contrasena) => {
  try {
    console.log('👤 Servicio loginUser: Iniciando login');
    console.log('👤 Usuario:', usuario);
    console.log('👤 API URL:', `${API_BASE_URL}/usuarios/login`);
    
    const requestData = { usuario, contrasena };
    console.log('👤 Datos de request:', JSON.stringify(requestData, null, 2));
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/login`, requestData);
    console.log('👤 Response status:', response.status);
    console.log('👤 Response ok:', response.ok);
    
    const data = await response.json();
    console.log('👤 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso en servicio');
      return data;
    } else {
      console.log('❌ Login falló en servicio');
      return data;
    }
  } catch (error) {
    console.error('❌ Error en loginUser servicio:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
};

// ============ CRUD USUARIOS ============

export const getAllUsers = async () => {
  try {
    console.log('👤 Obteniendo todos los usuarios');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/usuarios`);
    const data = await response.json();
    
    // El backend devuelve la estructura: { success: true, data: { users: [...] } }
    if (data.success && data.data && data.data.users) {
      return {
        success: true,
        data: {
          users: data.data.users
        }
      };
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getAllUsers:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    console.log('👤 Obteniendo usuario por ID:', id);
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/usuarios/${id}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log('👤 Actualizando usuario:', id);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/usuarios/${id}`, userData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    console.log('👤 Eliminando usuario:', id);
    
    const response = await SecureHttpClient.delete(`${API_BASE_URL}/usuarios/${id}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
};

// ============ RECUPERACIÓN DE CONTRASEÑA ============

export const verifyEmail = async (correo) => {
  try {
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/verify-email`, { correo });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en verifyEmail:', error);
    throw error;
  }
};

export const requestCode = async (correo) => {
  try {
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/request-code`, { correo });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en requestCode:', error);
    throw error;
  }
};

export const verifyCode = async (correo, codigo) => {
  try {
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/verify-code`, { correo, codigo });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en verifyCode:', error);
    throw error;
  }
};

export const verifyCodeAndResetPassword = async (correo, codigo, nuevaContrasena) => {
  try {
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/verify-code-reset`, {
      correo,
      codigo,
      nuevaContrasena
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en verifyCodeAndResetPassword:', error);
    throw error;
  }
};

// ============ ACTUALIZAR INFORMACIÓN DEL PERFIL ============

export const updateUserInfo = async (id, userData) => {
  try {
    console.log('👤 Actualizando información de usuario:', id);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/usuarios/update-info/${id}`, userData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateUserInfo:', error);
    throw error;
  }
};

// ============ ACTUALIZAR CREDENCIALES ============

export const updateCredentials = async (id, credentials) => {
  try {
    console.log('👤 Actualizando credenciales de usuario:', id);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/usuarios/update-credentials/${id}`, credentials);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateCredentials:', error);
    throw error;
  }
};

// ============ GESTIÓN DE ADMINISTRADORES (SOLO SUPERADMIN) ============

export const createAdmin = async (adminData) => {
  try {
    console.log('👤 Creando nuevo administrador');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/usuarios/create-admin`, adminData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en createAdmin:', error);
    throw error;
  }
};

export const promoteToAdmin = async (userId, isSuperAdmin = false) => {
  try {
    console.log('👤 Promoviendo usuario a administrador:', userId);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/usuarios/promote-admin/${userId}`, {
      es_super_admin: Boolean(isSuperAdmin)
    });
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en promoteToAdmin:', error);
    throw error;
  }
};

export const demoteAdmin = async (userId) => {
  try {
    console.log('👤 Degradando administrador a cliente:', userId);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/usuarios/demote-admin/${userId}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en demoteAdmin:', error);
    throw error;
  }
};
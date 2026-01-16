// Cliente HTTP simplificado para desarrollo
import SecureStorageManager from './SecureStorage';
import { ENV_CONFIG } from '../../config/env.js';

class SecureHttpClient {
  
  static DEFAULT_TIMEOUT = 15000; // 15 segundos

  // Headers básicos
  static getBasicHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Obtener headers con autenticación
  static async getAuthHeaders() {
    const headers = this.getBasicHeaders();
    
    try {
      const token = await SecureStorageManager.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        if (ENV_CONFIG.API_DEBUG) {
          console.log('🔑 Token agregado a headers');
        }
      } else {
        if (ENV_CONFIG.API_DEBUG) {
          console.log('⚠️ No hay token disponible');
        }
      }
    } catch (error) {
      // Log del error pero continuar sin token para requests públicos
      if (ENV_CONFIG.API_DEBUG) {
        console.log('⚠️ Error obteniendo token:', error.message);
      }
    }
    
    return headers;
  }

  // Realizar request básico
  static async makeRequest(url, options = {}) {
    try {
      const requestOptions = {
        ...options,
        headers: {
          ...this.getBasicHeaders(),
          ...options.headers,
        },
      };

      if (ENV_CONFIG.API_DEBUG) {
        console.log(`🌐 ${options.method || 'GET'} ${url}`);
      }
      
      const response = await fetch(url, requestOptions);
      
      if (ENV_CONFIG.API_DEBUG) {
        console.log(`📡 Response: ${response.status}`);
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ Request error:', error.message);
      throw error;
    }
  }

  // GET request
  static async get(url, options = {}) {
    const headers = await this.getAuthHeaders();
    
    return this.makeRequest(url, {
      method: 'GET',
      headers: { ...headers, ...options.headers },
      ...options,
    });
  }

  // POST request
  static async post(url, data = null, options = {}) {
    const headers = await this.getAuthHeaders();
    
    return this.makeRequest(url, {
      method: 'POST',
      headers: { ...headers, ...options.headers },
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  // PUT request
  static async put(url, data = null, options = {}) {
    const headers = await this.getAuthHeaders();
    
    return this.makeRequest(url, {
      method: 'PUT',
      headers: { ...headers, ...options.headers },
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  // DELETE request
  static async delete(url, options = {}) {
    const headers = await this.getAuthHeaders();
    
    return this.makeRequest(url, {
      method: 'DELETE',
      headers: { ...headers, ...options.headers },
      ...options,
    });
  }
}

export default SecureHttpClient;
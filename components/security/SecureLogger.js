// Logger seguro que no expone información sensible en producción
import { ENV_CONFIG } from '../../config/env.js';

class SecureLogger {
  
  // Palabras clave sensibles que deben ser censuradas
  static SENSITIVE_KEYS = [
    'password', 'contrasena', 'token', 'secret', 'key', 'auth',
    'credential', 'session', 'cookie', 'bearer', 'jwt', 'refresh',
    'pin', 'code', 'otp', 'biometric', 'fingerprint', 'face'
  ];

  // Censurar datos sensibles
  static sanitizeData(data) {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Si es un string que parece ser un token JWT
      if (data.includes('.') && data.length > 50) {
        return `${data.substring(0, 10)}...[CENSORED]...${data.substring(data.length - 10)}`;
      }
      
      // Si es una contraseña o similar
      if (data.length > 6 && data.length < 50) {
        return '***[CENSORED]***';
      }
      
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = Array.isArray(data) ? [] : {};
      
      for (const [key, value] of Object.entries(data)) {
        const keyLower = key.toLowerCase();
        const isSensitive = this.SENSITIVE_KEYS.some(sensitiveKey => 
          keyLower.includes(sensitiveKey)
        );
        
        if (isSensitive) {
          sanitized[key] = '***[CENSORED]***';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  // Log de información general
  static info(message, data = null) {
    if (ENV_CONFIG.DEBUG_MODE && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      console.log(`ℹ️ ${message}`, sanitizedData);
    }
  }

  // Log de errores (siempre se muestran pero sanitizados)
  static error(message, error = null) {
    const sanitizedError = error ? this.sanitizeData(error) : null;
    console.error(`❌ ${message}`, sanitizedError);
  }

  // Log de advertencias
  static warn(message, data = null) {
    if (ENV_CONFIG.DEBUG_MODE && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      console.warn(`⚠️ ${message}`, sanitizedData);
    }
  }

  // Log de éxito
  static success(message, data = null) {
    if (ENV_CONFIG.DEBUG_MODE && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      console.log(`✅ ${message}`, sanitizedData);
    }
  }

  // Log de debug (solo en desarrollo)
  static debug(message, data = null) {
    if (ENV_CONFIG.DEBUG_MODE && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      console.log(`🐛 ${message}`, sanitizedData);
    }
  }

  // Log de API calls (con sanitización especial)
  static apiCall(method, url, data = null) {
    if (ENV_CONFIG.API_DEBUG && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      console.log(`🌐 API ${method.toUpperCase()}: ${url}`, sanitizedData);
    }
  }

  // Log de respuestas de API
  static apiResponse(status, data = null) {
    if (ENV_CONFIG.API_DEBUG && __DEV__) {
      const sanitizedData = data ? this.sanitizeData(data) : null;
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} API Response [${status}]:`, sanitizedData);
    }
  }

  // Log de autenticación (extra cuidadoso)
  static auth(message, data = null) {
    if (ENV_CONFIG.DEBUG_MODE && __DEV__) {
      // Para logs de auth, solo mostrar estructura, no contenido
      let sanitizedData = null;
      if (data && typeof data === 'object') {
        sanitizedData = {};
        for (const key of Object.keys(data)) {
          sanitizedData[key] = '***[HIDDEN]***';
        }
      }
      console.log(`🔐 AUTH: ${message}`, sanitizedData);
    }
  }

  // Log de seguridad (siempre se registra)
  static security(message, data = null) {
    const sanitizedData = data ? this.sanitizeData(data) : null;
    console.log(`🛡️ SECURITY: ${message}`, sanitizedData);
  }

  // Verificar si los logs están habilitados
  static isDebugEnabled() {
    return ENV_CONFIG.DEBUG_MODE && __DEV__;
  }

  // Verificar si los logs de API están habilitados
  static isApiDebugEnabled() {
    return ENV_CONFIG.API_DEBUG && __DEV__;
  }
}

export default SecureLogger;
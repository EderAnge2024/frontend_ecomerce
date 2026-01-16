// Configuración centralizada de variables de entorno con validaciones de seguridad

// Detectar si estamos en entorno de desarrollo
// __DEV__ solo está disponible en React Native, no en Node.js
const isDev = (typeof __DEV__ !== 'undefined' && __DEV__) || 
              (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') ||
              (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_NODE_ENV === 'development');

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'ECommerce Mobile',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  
  // Debug Configuration (SOLO EN DESARROLLO)
  DEBUG_MODE: isDev && process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  API_DEBUG: isDev && process.env.EXPO_PUBLIC_API_DEBUG === 'true',
  
  // Security Configuration
  REQUIRE_HTTPS: process.env.EXPO_PUBLIC_REQUIRE_HTTPS !== 'false', // Por defecto true
  ENABLE_CERTIFICATE_PINNING: process.env.EXPO_PUBLIC_CERT_PINNING === 'true',
  SESSION_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_SESSION_TIMEOUT) || 3600000, // 1 hora
  
  // Helper functions
  isDevelopment: () => ENV_CONFIG.NODE_ENV === 'development',
  isProduction: () => ENV_CONFIG.NODE_ENV === 'production',
  
  // Validar configuración de seguridad
  validateSecurity: () => {
    const issues = [];
    
    // Verificar HTTPS en producción
    if (ENV_CONFIG.isProduction() && !ENV_CONFIG.API_BASE_URL.startsWith('https://')) {
      issues.push('⚠️ HTTPS requerido en producción');
    }
    
    // Verificar debug deshabilitado en producción
    if (ENV_CONFIG.isProduction() && (ENV_CONFIG.DEBUG_MODE || ENV_CONFIG.API_DEBUG)) {
      issues.push('⚠️ Debug mode debe estar deshabilitado en producción');
    }
    
    // Verificar URL de API válida
    try {
      new URL(ENV_CONFIG.API_BASE_URL);
    } catch {
      issues.push('⚠️ URL de API inválida');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  },
  
  // Log configuration (solo en desarrollo y si debug está habilitado)
  logConfig: () => {
    if (ENV_CONFIG.DEBUG_MODE && isDev) {
      console.log('📱 App Configuration:');
      console.log('  - App Name:', ENV_CONFIG.APP_NAME);
      console.log('  - Version:', ENV_CONFIG.APP_VERSION);
      console.log('  - Environment:', ENV_CONFIG.NODE_ENV);
      console.log('  - API URL:', ENV_CONFIG.API_BASE_URL);
      console.log('  - Debug Mode:', ENV_CONFIG.DEBUG_MODE);
      console.log('  - API Debug:', ENV_CONFIG.API_DEBUG);
      console.log('  - Require HTTPS:', ENV_CONFIG.REQUIRE_HTTPS);
      console.log('  - Certificate Pinning:', ENV_CONFIG.ENABLE_CERTIFICATE_PINNING);
      
      // Validar configuración de seguridad
      const validation = ENV_CONFIG.validateSecurity();
      if (!validation.isValid) {
        console.warn('🔒 Problemas de seguridad detectados:');
        validation.issues.forEach(issue => console.warn(issue));
      } else {
        console.log('✅ Configuración de seguridad válida');
      }
    }
  },
  
  // Obtener configuración sanitizada para logs
  getSanitizedConfig: () => {
    return {
      APP_NAME: ENV_CONFIG.APP_NAME,
      APP_VERSION: ENV_CONFIG.APP_VERSION,
      NODE_ENV: ENV_CONFIG.NODE_ENV,
      API_BASE_URL: ENV_CONFIG.API_BASE_URL.replace(/\/\/.*@/, '//***@'), // Ocultar credenciales si las hay
      DEBUG_MODE: ENV_CONFIG.DEBUG_MODE,
      REQUIRE_HTTPS: ENV_CONFIG.REQUIRE_HTTPS,
    };
  }
};

// Validar configuración al importar
const validation = ENV_CONFIG.validateSecurity();
if (!validation.isValid && isDev) {
  console.error('🚨 Configuración de seguridad inválida:');
  validation.issues.forEach(issue => console.error(issue));
}

// Log configuration on import (solo en desarrollo)
ENV_CONFIG.logConfig();

export default ENV_CONFIG;
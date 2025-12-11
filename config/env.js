// Configuración centralizada de variables de entorno
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'ECommerce Mobile',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  
  // Debug Configuration
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  API_DEBUG: process.env.EXPO_PUBLIC_API_DEBUG === 'true',
  
  // Helper functions
  isDevelopment: () => ENV_CONFIG.NODE_ENV === 'development',
  isProduction: () => ENV_CONFIG.NODE_ENV === 'production',
  
  // Log configuration (only in development)
  logConfig: () => {
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('📱 App Configuration:');
      console.log('  - App Name:', ENV_CONFIG.APP_NAME);
      console.log('  - Version:', ENV_CONFIG.APP_VERSION);
      console.log('  - Environment:', ENV_CONFIG.NODE_ENV);
      console.log('  - API URL:', ENV_CONFIG.API_BASE_URL);
      console.log('  - Debug Mode:', ENV_CONFIG.DEBUG_MODE);
      console.log('  - API Debug:', ENV_CONFIG.API_DEBUG);
    }
  }
};

// Log configuration on import (only in development)
ENV_CONFIG.logConfig();

export default ENV_CONFIG;
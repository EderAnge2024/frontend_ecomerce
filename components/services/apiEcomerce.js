import { ENV_CONFIG } from '../../config/env.js';

// Usar la configuración centralizada
const BASE_URL = ENV_CONFIG.API_BASE_URL;

// Log para debugging de API (solo si está habilitado)
if (ENV_CONFIG.API_DEBUG) {
  console.log('🌐 API Service initialized with URL:', BASE_URL);
}

export default BASE_URL;

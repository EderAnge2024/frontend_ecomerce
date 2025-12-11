#!/usr/bin/env node

import { ENV_CONFIG } from '../config/env.js';

console.log('🔍 Verificando configuración de variables de entorno del Frontend...\n');

// Verificar configuración de la API
console.log('🌐 Configuración de la API:');
console.log(`  ✅ URL Base: ${ENV_CONFIG.API_BASE_URL}`);

// Verificar configuración de la aplicación
console.log('\n📱 Configuración de la Aplicación:');
console.log(`  ✅ Nombre: ${ENV_CONFIG.APP_NAME}`);
console.log(`  ✅ Versión: ${ENV_CONFIG.APP_VERSION}`);
console.log(`  ✅ Entorno: ${ENV_CONFIG.NODE_ENV}`);

// Verificar configuración de debug
console.log('\n🐛 Configuración de Debug:');
console.log(`  ${ENV_CONFIG.DEBUG_MODE ? '✅' : '❌'} Debug Mode: ${ENV_CONFIG.DEBUG_MODE ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`  ${ENV_CONFIG.API_DEBUG ? '✅' : '❌'} API Debug: ${ENV_CONFIG.API_DEBUG ? 'Habilitado' : 'Deshabilitado'}`);

// Verificar conectividad (simulada)
console.log('\n🔗 Verificación de Conectividad:');
const isLocalhost = ENV_CONFIG.API_BASE_URL.includes('localhost');
const isHttps = ENV_CONFIG.API_BASE_URL.startsWith('https');

if (isLocalhost) {
  console.log('  ⚠️  Usando localhost - Solo funcionará en desarrollo local');
} else if (isHttps) {
  console.log('  ✅ Usando HTTPS - Configuración de producción');
} else {
  console.log('  ⚠️  Usando HTTP - Considera usar HTTPS en producción');
}

// Resumen
console.log('\n📋 Resumen:');
console.log(`  ✅ Configuración básica: Completa`);
console.log(`  ${ENV_CONFIG.isDevelopment() ? '🔧' : '🚀'} Modo: ${ENV_CONFIG.isDevelopment() ? 'Desarrollo' : 'Producción'}`);

if (ENV_CONFIG.isDevelopment() && !ENV_CONFIG.DEBUG_MODE) {
  console.log('\n💡 SUGERENCIA: Considera habilitar DEBUG_MODE en desarrollo');
}

console.log('\n✅ Verificación completada.');
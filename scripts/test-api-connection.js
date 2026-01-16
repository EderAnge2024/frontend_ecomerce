#!/usr/bin/env node

/**
 * Script para probar la conectividad con el backend API
 */

// Leer la configuración directamente del archivo .env
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función simple para leer .env
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env');
    const envContent = readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.log('⚠️ No se pudo leer el archivo .env, usando valores por defecto');
    return {};
  }
}

const env = loadEnv();

// Configuración simple para el test
const API_BASE_URL = env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const DEBUG_MODE = env.EXPO_PUBLIC_DEBUG_MODE === 'true';
const API_DEBUG = env.EXPO_PUBLIC_API_DEBUG === 'true';
const REQUIRE_HTTPS = env.EXPO_PUBLIC_REQUIRE_HTTPS !== 'false';

console.log('🔍 PROBANDO CONECTIVIDAD CON EL BACKEND API');
console.log('===========================================\n');

console.log('📋 Configuración actual:');
console.log(`   API_BASE_URL: ${API_BASE_URL}`);
console.log(`   DEBUG_MODE: ${DEBUG_MODE}`);
console.log(`   API_DEBUG: ${API_DEBUG}`);
console.log(`   REQUIRE_HTTPS: ${REQUIRE_HTTPS}\n`);

// Test de conectividad básica
async function testConnection() {
  try {
    console.log('🌐 Probando conexión básica...');
    
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa!');
      console.log(`   Productos encontrados: ${data.productos ? data.productos.length : 0}`);
      
      if (data.productos && data.productos.length > 0) {
        console.log('   Ejemplo de producto:');
        console.log(`     - ID: ${data.productos[0].id_producto || data.productos[0].id}`);
        console.log(`     - Título: ${data.productos[0].title}`);
        console.log(`     - Precio: ${data.productos[0].price}`);
      }
    } else {
      console.log('❌ Error en la respuesta del servidor');
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log('❌ Error de conectividad');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que el backend esté ejecutándose');
      console.log('   2. Verificar la URL de la API en .env');
      console.log('   3. Verificar que el puerto 3000 esté abierto');
      console.log('   4. Si usas emulador, usar IP de red local en lugar de localhost');
    }
  }
}

// Test de productos combinados
async function testProductosCombinados() {
  try {
    console.log('\n🔄 Probando productos combinados...');
    
    const response = await fetch(`${API_BASE_URL}/productos/combinados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Productos combinados obtenidos!');
      console.log(`   Total: ${data.productos ? data.productos.length : 0}`);
      if (data.stats) {
        console.log(`   De BD: ${data.stats.database}`);
        console.log(`   De API externa: ${data.stats.api}`);
      }
    } else {
      console.log('❌ Error obteniendo productos combinados');
    }
    
  } catch (error) {
    console.log('❌ Error en productos combinados:', error.message);
  }
}

// Ejecutar tests
async function runTests() {
  await testConnection();
  await testProductosCombinados();
  
  console.log('\n📝 Notas importantes:');
  console.log('   - Si usas un emulador/dispositivo, cambia localhost por tu IP local');
  console.log('   - Verifica que el backend esté ejecutándose en el puerto 3000');
  console.log('   - Revisa los logs del backend para más detalles');
}

runTests();
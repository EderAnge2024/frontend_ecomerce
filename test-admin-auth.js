#!/usr/bin/env node

/**
 * Test para verificar la autenticación del admin y acceso a recursos
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función simple para leer .env
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
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
const API_BASE_URL = env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

console.log('🔐 TEST DE AUTENTICACIÓN DEL ADMIN');
console.log('==================================\n');
console.log(`API URL: ${API_BASE_URL}\n`);

// Test completo de autenticación y acceso a recursos
async function testAdminAuth() {
  console.log('🧪 Probando flujo completo de autenticación del admin...\n');
  
  let authToken = null;
  let userId = null;
  
  // PASO 1: Login
  console.log('1️⃣ PASO 1: Login con admin');
  console.log('--------------------------------');
  
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        contrasena: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success}`);
    
    if (loginData.success && loginData.data) {
      const user = loginData.data.user;
      const tokens = loginData.data.tokens;
      
      authToken = tokens?.accessToken;
      userId = user?.id_usuario;
      
      console.log('   ✅ LOGIN EXITOSO');
      console.log(`   👤 Usuario: ${user.nombre} (${user.rol})`);
      console.log(`   🆔 ID: ${user.id_usuario}`);
      console.log(`   👑 Super Admin: ${user.es_super_admin ? 'SÍ' : 'NO'}`);
      console.log(`   🔑 Token: ${authToken ? 'PRESENTE' : 'AUSENTE'}`);
      
      if (authToken) {
        console.log(`   🔑 Token (primeros 50 chars): ${authToken.substring(0, 50)}...`);
      }
    } else {
      console.log('   ❌ LOGIN FALLÓ');
      console.log(`   Mensaje: ${loginData.message}`);
      return;
    }
  } catch (error) {
    console.error('   💥 ERROR EN LOGIN:', error.message);
    return;
  }
  
  // PASO 2: Test de acceso a productos
  console.log('\n2️⃣ PASO 2: Acceso a productos del admin');
  console.log('---------------------------------------');
  
  try {
    const productosResponse = await fetch(`${API_BASE_URL}/productos/usuario/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const productosData = await productosResponse.json();
    
    console.log(`   Status: ${productosResponse.status}`);
    console.log(`   Success: ${productosData.success}`);
    
    if (productosData.success) {
      console.log('   ✅ PRODUCTOS OBTENIDOS');
      console.log(`   📦 Cantidad: ${productosData.productos ? productosData.productos.length : 0}`);
      
      if (productosData.productos && productosData.productos.length > 0) {
        console.log('   📋 Primeros productos:');
        productosData.productos.slice(0, 3).forEach((producto, index) => {
          console.log(`     ${index + 1}. ${producto.nombre} - $${producto.precio}`);
        });
      } else {
        console.log('   📋 No hay productos para este usuario');
      }
    } else {
      console.log('   ❌ ERROR OBTENIENDO PRODUCTOS');
      console.log(`   Mensaje: ${productosData.message}`);
      console.log(`   Error: ${productosData.error}`);
    }
  } catch (error) {
    console.error('   💥 ERROR EN PRODUCTOS:', error.message);
  }
  
  // PASO 3: Test de acceso a pedidos
  console.log('\n3️⃣ PASO 3: Acceso a pedidos');
  console.log('---------------------------');
  
  try {
    const pedidosResponse = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const pedidosData = await pedidosResponse.json();
    
    console.log(`   Status: ${pedidosResponse.status}`);
    console.log(`   Success: ${pedidosData.success}`);
    
    if (pedidosData.success) {
      console.log('   ✅ PEDIDOS OBTENIDOS');
      console.log(`   📋 Cantidad: ${pedidosData.pedidos ? pedidosData.pedidos.length : 0}`);
      
      if (pedidosData.pedidos && pedidosData.pedidos.length > 0) {
        console.log('   📋 Primeros pedidos:');
        pedidosData.pedidos.slice(0, 3).forEach((pedido, index) => {
          console.log(`     ${index + 1}. Pedido #${pedido.id_pedido} - $${pedido.total} (${pedido.estado})`);
        });
      } else {
        console.log('   📋 No hay pedidos');
      }
    } else {
      console.log('   ❌ ERROR OBTENIENDO PEDIDOS');
      console.log(`   Mensaje: ${pedidosData.message}`);
    }
  } catch (error) {
    console.error('   💥 ERROR EN PEDIDOS:', error.message);
  }
  
  // PASO 4: Test de acceso a usuarios/clientes
  console.log('\n4️⃣ PASO 4: Acceso a usuarios/clientes');
  console.log('------------------------------------');
  
  try {
    const usuariosResponse = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const usuariosData = await usuariosResponse.json();
    
    console.log(`   Status: ${usuariosResponse.status}`);
    console.log(`   Success: ${usuariosData.success}`);
    
    if (usuariosData.success) {
      console.log('   ✅ USUARIOS OBTENIDOS');
      console.log(`   👥 Cantidad: ${usuariosData.data?.users ? usuariosData.data.users.length : 0}`);
      
      if (usuariosData.data?.users && usuariosData.data.users.length > 0) {
        console.log('   📋 Primeros usuarios:');
        usuariosData.data.users.slice(0, 3).forEach((usuario, index) => {
          console.log(`     ${index + 1}. ${usuario.nombre} ${usuario.apellido} (${usuario.rol})`);
        });
      }
    } else {
      console.log('   ❌ ERROR OBTENIENDO USUARIOS');
      console.log(`   Mensaje: ${usuariosData.message}`);
    }
  } catch (error) {
    console.error('   💥 ERROR EN USUARIOS:', error.message);
  }
  
  // RESUMEN
  console.log('\n🎯 RESUMEN DEL TEST:');
  console.log('====================');
  
  if (authToken) {
    console.log('✅ Token de autenticación: PRESENTE');
    console.log('✅ Login con admin: EXITOSO');
    console.log('💡 Si los recursos (productos, pedidos, usuarios) fallan:');
    console.log('   1. Verificar que el token se esté enviando en la app');
    console.log('   2. Verificar que SecureStorage guarde el token correctamente');
    console.log('   3. Verificar que SecureHttpClient agregue el header Authorization');
    console.log('   4. Verificar permisos en el backend para este usuario');
  } else {
    console.log('❌ Token de autenticación: AUSENTE');
    console.log('❌ Problema en el proceso de login');
  }
  
  console.log('\n🔍 PARA DEBUGGEAR EN LA APP:');
  console.log('============================');
  console.log('1. Verificar logs de SecureStorage al hacer login');
  console.log('2. Verificar logs de SecureHttpClient en requests');
  console.log('3. Verificar que AuthContext guarde el token correctamente');
  console.log('4. Verificar respuestas de API en Network tab');
}

testAdminAuth();
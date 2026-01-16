#!/usr/bin/env node

/**
 * Test final para verificar que la validación y login funcionen correctamente
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
const API_BASE_URL = env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

console.log('🎯 TEST FINAL DE VALIDACIÓN Y LOGIN');
console.log('===================================\n');
console.log(`API URL: ${API_BASE_URL}\n`);

// Test directo del endpoint
async function testDirectLogin() {
  console.log('🔐 Probando login directo...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        contrasena: 'admin123'
      })
    });
    
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    
    if (data.success) {
      const user = data.data?.user || data.user;
      console.log('   ✅ LOGIN EXITOSO');
      console.log('   Usuario:', user?.nombre);
      console.log('   Rol:', user?.rol);
      console.log('   Es Admin:', user?.rol === 'administrador');
      
      return { success: true, user };
    } else {
      console.log('   ❌ LOGIN FALLÓ');
      console.log('   Mensaje:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('   💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

// Test con credenciales incorrectas
async function testWrongCredentials() {
  console.log('\n🔐 Probando credenciales incorrectas...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'wrong',
        contrasena: 'wrong'
      })
    });
    
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    
    if (!data.success) {
      console.log('   ✅ CREDENCIALES INCORRECTAS RECHAZADAS CORRECTAMENTE');
      console.log('   Mensaje:', data.message);
      return { success: true, rejected: true };
    } else {
      console.log('   ❌ CREDENCIALES INCORRECTAS ACEPTADAS (PROBLEMA DE SEGURIDAD)');
      return { success: false, securityIssue: true };
    }
  } catch (error) {
    console.error('   💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

// Test principal
async function runFinalTest() {
  console.log('🧪 Ejecutando test final...\n');
  
  // Test 1: Login correcto
  const correctLogin = await testDirectLogin();
  
  // Test 2: Login incorrecto
  const wrongLogin = await testWrongCredentials();
  
  console.log('\n🎯 RESUMEN FINAL:');
  console.log('================');
  
  if (correctLogin.success) {
    console.log('✅ Login con credenciales correctas: FUNCIONA');
  } else {
    console.log('❌ Login con credenciales correctas: FALLA');
  }
  
  if (wrongLogin.success && wrongLogin.rejected) {
    console.log('✅ Rechazo de credenciales incorrectas: FUNCIONA');
  } else {
    console.log('❌ Rechazo de credenciales incorrectas: FALLA');
  }
  
  console.log('\n💡 INSTRUCCIONES PARA LA APP:');
  console.log('=============================');
  console.log('1. Abre la app en tu dispositivo/emulador');
  console.log('2. Ve a la pestaña "Perfil"');
  console.log('3. Haz clic en "Iniciar Sesión"');
  console.log('4. Ingresa:');
  console.log('   - Usuario: admin');
  console.log('   - Contraseña: admin123');
  console.log('5. Haz clic en "Iniciar Sesión"');
  console.log('6. Deberías ver:');
  console.log('   - Alert "Éxito: Inicio de sesión exitoso"');
  console.log('   - El modal se cierra');
  console.log('   - PerfilScreen muestra el perfil del usuario');
  console.log('   - Aparece el botón "Panel de Administrador"');
  console.log('7. Haz clic en "Panel de Administrador" para acceder al AdminHome');
  
  console.log('\n🔍 SI NO FUNCIONA, REVISAR:');
  console.log('===========================');
  console.log('- Console logs en la app (usar React Native Debugger)');
  console.log('- AuthStateDebug component en la esquina superior derecha');
  console.log('- Verificar que el backend esté corriendo');
  console.log('- Verificar la configuración de red en .env');
}

runFinalTest();
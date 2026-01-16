#!/usr/bin/env node

/**
 * Test paso a paso del proceso de login para identificar dónde falla
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

console.log('🔍 TEST PASO A PASO DEL LOGIN');
console.log('=============================\n');
console.log(`API URL: ${API_BASE_URL}\n`);

// Simular InputValidator
class InputValidator {
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/[<>]/g, '').replace(/['"]/g, '').replace(/[&]/g, '&amp;').substring(0, 1000);
  }

  static validateInput(input, type = 'text') {
    const result = { isValid: false, sanitized: '', errors: [] };

    if (!input) {
      result.errors.push('Input vacío');
      return result;
    }

    if (typeof input !== 'string') {
      result.errors.push('Input debe ser string');
      return result;
    }

    switch (type) {
      case 'username':
        result.isValid = this.isValidUsername(input);
        if (!result.isValid) result.errors.push('Usuario inválido');
        break;
      case 'text':
      default:
        result.isValid = input.length > 0 && input.length <= 1000;
        if (!result.isValid) result.errors.push('Texto inválido');
        break;
    }

    if (result.isValid) {
      result.sanitized = this.sanitizeText(input);
    }

    return result;
  }

  static validateObject(obj, schema) {
    const result = { isValid: true, sanitized: {}, errors: [] };

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const validation = this.validateInput(value, rules.type);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(`${key}: ${validation.errors.join(', ')}`);
      } else {
        result.sanitized[key] = validation.sanitized;
      }
    }

    return result;
  }

  static validateLoginData(data) {
    const schema = {
      usuario: { type: 'username' },
      contrasena: { type: 'text' }
    };

    return this.validateObject(data, schema);
  }
}

// Simular SecureHttpClient.post
async function simulateSecureHttpPost(url, data) {
  console.log('🌐 SecureHttpClient.post');
  console.log('   URL:', url);
  console.log('   Data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  console.log('   Response status:', response.status);
  console.log('   Response ok:', response.ok);
  
  return response;
}

// Simular loginUser service
async function simulateLoginUser(usuario, contrasena) {
  console.log('\n👤 Simulando servicio loginUser...');
  console.log('   Usuario:', usuario);
  console.log('   API URL:', `${API_BASE_URL}/usuarios/login`);
  
  const requestData = { usuario, contrasena };
  console.log('   Datos de request:', JSON.stringify(requestData, null, 2));
  
  try {
    const response = await simulateSecureHttpPost(`${API_BASE_URL}/usuarios/login`, requestData);
    const data = await response.json();
    
    console.log('   Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('   ✅ Login exitoso en servicio');
      return data;
    } else {
      console.log('   ❌ Login falló en servicio');
      return data;
    }
  } catch (error) {
    console.error('   ❌ Error en loginUser servicio:', error);
    throw error;
  }
}

// Simular AuthContext.login
async function simulateAuthContextLogin(usuario, contrasena) {
  console.log('\n🔐 Simulando AuthContext.login...');
  
  try {
    const response = await simulateLoginUser(usuario, contrasena);
    
    if (response.success) {
      const userData = response.data?.user || response.user;
      const tokens = response.data?.tokens || response.tokens;
      
      console.log('   Datos de usuario extraídos:', JSON.stringify(userData, null, 2));
      console.log('   Tokens extraídos:', tokens ? 'PRESENTES' : 'AUSENTES');
      
      const isAdminUser = userData.rol === 'administrador';
      console.log('   Verificación de permisos admin:', {
        rol: userData.rol,
        es_super_admin: userData.es_super_admin,
        isAdmin: isAdminUser
      });
      
      return { success: true, user: userData, isAdmin: isAdminUser };
    } else {
      console.warn('   ❌ Login falló:', response.message);
      return { success: false, message: response.message };
    }
  } catch (error) {
    console.error('   💥 Error en login:', error);
    return { success: false, message: 'Error al iniciar sesión: ' + error.message };
  }
}

// Simular handleLogin completo
async function simulateHandleLogin(usuario, password) {
  console.log('📱 Simulando handleLogin del componente Login...');
  console.log('   Usuario:', usuario);
  console.log('   Password length:', password?.length);
  
  // PASO 1: Validación básica
  console.log('\n1️⃣ PASO 1: Validación básica');
  console.log('-----------------------------');
  
  if (!usuario || !password) {
    console.log('   ❌ Error: Campos vacíos');
    return { success: false, message: 'Por favor completa todos los campos' };
  }
  console.log('   ✅ Campos no están vacíos');

  // PASO 2: Validación con InputValidator
  console.log('\n2️⃣ PASO 2: Validación con InputValidator');
  console.log('------------------------------------------');
  
  const loginValidation = InputValidator.validateLoginData({
    usuario: usuario,
    contrasena: password
  });

  console.log('   Validación resultado:', JSON.stringify(loginValidation, null, 2));

  if (!loginValidation.isValid) {
    console.log('   ❌ Error de validación:', loginValidation.errors.join('\n'));
    return { success: false, message: 'Error de validación: ' + loginValidation.errors.join('\n') };
  }
  console.log('   ✅ Validación exitosa');

  // PASO 3: Llamada a AuthContext.login
  console.log('\n3️⃣ PASO 3: Llamada a AuthContext.login');
  console.log('--------------------------------------');
  
  try {
    const response = await simulateAuthContextLogin(loginValidation.sanitized.usuario, password);
    
    console.log('\n📋 Respuesta del login recibida:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('   ✅ Login exitoso');
      
      if (response.isAdmin) {
        console.log('   👑 Usuario administrador detectado - debería mostrar AdminHome');
        return { success: true, isAdmin: true, user: response.user, action: 'showAdminPanel' };
      } else {
        console.log('   👤 Usuario no es administrador - debería ejecutar onSuccess callback');
        return { success: true, isAdmin: false, user: response.user, action: 'executeCallback' };
      }
    } else {
      console.log('   ❌ Login falló:', response.message);
      return { success: false, message: response.message || 'Usuario o contraseña incorrectos' };
    }
  } catch (error) {
    console.error('   💥 Error en proceso de login:', error);
    return { success: false, message: 'Ocurrió un error al iniciar sesión' };
  }
}

// Test principal
async function testStepByStep() {
  console.log('🧪 Iniciando test paso a paso...\n');
  
  const result = await simulateHandleLogin('admin', 'admin123');
  
  console.log('\n🎯 RESULTADO FINAL:');
  console.log('==================');
  console.log('Success:', result.success);
  console.log('Message:', result.message || 'N/A');
  console.log('IsAdmin:', result.isAdmin || false);
  console.log('User:', result.user ? 'PRESENTE' : 'AUSENTE');
  console.log('Action:', result.action || 'N/A');
  
  if (result.success) {
    console.log('\n✅ El proceso de login debería funcionar');
    console.log('💡 Si no funciona en la app, el problema está en:');
    if (result.action === 'showAdminPanel') {
      console.log('   - setShowAdminPanel(true) no se ejecuta');
      console.log('   - AdminHome no se renderiza');
    } else if (result.action === 'executeCallback') {
      console.log('   - onSuccess callback no se ejecuta');
      console.log('   - PerfilScreen no se actualiza');
      console.log('   - AuthContext state no se propaga');
    }
  } else {
    console.log('\n❌ El proceso de login falla en:', result.message);
  }
}

testStepByStep();
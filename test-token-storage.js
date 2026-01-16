#!/usr/bin/env node

/**
 * Test para verificar el almacenamiento de tokens
 */

console.log('🔑 TEST DE ALMACENAMIENTO DE TOKENS');
console.log('==================================\n');

// Simular SecureStorageManager
class MockSecureStorageManager {
  static storage = {};
  
  static async setSecureItem(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    this.storage[`secure_${key}`] = value;
    console.log(`🔒 Dato almacenado: ${key}`);
    return true;
  }

  static async getSecureItem(key) {
    const value = this.storage[`secure_${key}`];
    if (value) {
      console.log(`🔓 Dato recuperado: ${key}`);
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return null;
  }

  static isTokenValid(token) {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('⚠️ Token expirado');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  }

  static async setToken(token) {
    if (!token) {
      console.error('❌ Token vacío, no se almacenará');
      return false;
    }
    
    if (!this.isTokenValid(token)) {
      console.error('❌ Token inválido, no se almacenará');
      return false;
    }
    
    const result = await this.setSecureItem('token', token);
    if (result) {
      console.log('✅ Token almacenado correctamente');
    }
    return result;
  }

  static async getToken() {
    const token = await this.getSecureItem('token');
    
    if (!token) {
      console.log('⚠️ No hay token almacenado');
      return null;
    }
    
    if (!this.isTokenValid(token)) {
      console.log('⚠️ Token expirado encontrado, eliminando...');
      delete this.storage['secure_token'];
      return null;
    }
    
    console.log('✅ Token válido recuperado');
    return token;
  }

  static async setUser(userData) {
    if (!userData) {
      console.error('❌ Datos de usuario vacíos');
      return false;
    }
    
    const safeUserData = { ...userData };
    delete safeUserData.password;
    delete safeUserData.contrasena;
    delete safeUserData.password_hash;
    
    const result = await this.setSecureItem('user', safeUserData);
    if (result) {
      console.log('✅ Usuario almacenado correctamente');
    }
    return result;
  }

  static async getUser() {
    const user = await this.getSecureItem('user');
    if (user) {
      console.log('✅ Usuario recuperado correctamente');
    }
    return user;
  }
}

// Simular el flujo de login
async function testTokenFlow() {
  console.log('🧪 Simulando flujo de almacenamiento de token...\n');
  
  // Simular respuesta del backend
  const mockLoginResponse = {
    success: true,
    data: {
      user: {
        id_usuario: 4,
        nombre: "Administrador",
        apellido: "Sistema",
        correo: "admin@ecommerce.com",
        rol: "administrador",
        usuario: "admin",
        es_super_admin: false
      },
      tokens: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGVjb21tZXJjZS5jb20iLCJyb2xlIjoiYWRtaW5pc3RyYWRvciIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImlhdCI6MTczNjcwMzU5OCwiZXhwIjoxNzM2NzA3MTk4LCJhdWQiOiJlY29tbWVyY2UtY2xpZW50IiwiaXNzIjoiZWNvbW1lcmNlLWFwaSJ9.example",
        refreshToken: "refresh_token_example",
        expiresIn: "1h"
      }
    }
  };
  
  console.log('1️⃣ PASO 1: Simular login exitoso');
  console.log('--------------------------------');
  
  if (mockLoginResponse.success) {
    const userData = mockLoginResponse.data?.user || mockLoginResponse.user;
    const tokens = mockLoginResponse.data?.tokens || mockLoginResponse.tokens;
    
    console.log('✅ Login exitoso simulado');
    console.log('   Usuario:', userData?.nombre);
    console.log('   Token presente:', !!tokens?.accessToken);
    
    console.log('\n2️⃣ PASO 2: Almacenar usuario');
    console.log('-----------------------------');
    
    const userSaved = await MockSecureStorageManager.setUser(userData);
    console.log('   Usuario guardado:', userSaved);
    
    console.log('\n3️⃣ PASO 3: Almacenar token');
    console.log('---------------------------');
    
    if (tokens?.accessToken) {
      const tokenSaved = await MockSecureStorageManager.setToken(tokens.accessToken);
      console.log('   Token guardado:', tokenSaved);
    } else {
      console.warn('   ⚠️ No se recibió token del backend');
    }
    
    console.log('\n4️⃣ PASO 4: Verificar almacenamiento');
    console.log('-----------------------------------');
    
    const retrievedUser = await MockSecureStorageManager.getUser();
    const retrievedToken = await MockSecureStorageManager.getToken();
    
    console.log('   Usuario recuperado:', retrievedUser ? 'SÍ' : 'NO');
    console.log('   Token recuperado:', retrievedToken ? 'SÍ' : 'NO');
    
    if (retrievedUser) {
      console.log('   Usuario nombre:', retrievedUser.nombre);
      console.log('   Usuario rol:', retrievedUser.rol);
    }
    
    if (retrievedToken) {
      console.log('   Token (primeros 50 chars):', retrievedToken.substring(0, 50) + '...');
    }
    
    console.log('\n5️⃣ PASO 5: Simular request con token');
    console.log('------------------------------------');
    
    const token = await MockSecureStorageManager.getToken();
    if (token) {
      console.log('   ✅ Token disponible para requests');
      console.log('   Header que se enviaría: Authorization: Bearer ' + token.substring(0, 20) + '...');
    } else {
      console.log('   ❌ No hay token disponible para requests');
    }
  }
  
  console.log('\n🎯 DIAGNÓSTICO:');
  console.log('===============');
  console.log('Si este test funciona pero la app no:');
  console.log('1. Verificar que AuthContext llame a setToken() correctamente');
  console.log('2. Verificar que SecureStorage esté funcionando en la app');
  console.log('3. Verificar que no haya errores en el proceso de login');
  console.log('4. Verificar que ENV_CONFIG.DEBUG_MODE esté habilitado');
  
  console.log('\n💡 LOGS ESPERADOS EN LA APP:');
  console.log('============================');
  console.log('🔐 Guardando token en almacenamiento...');
  console.log('🔒 Dato almacenado: token');
  console.log('✅ Token almacenado correctamente');
  console.log('🔑 Token agregado a headers');
}

testTokenFlow();
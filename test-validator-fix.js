#!/usr/bin/env node

/**
 * Test para verificar que el InputValidator corregido funcione con superadmin
 */

console.log('🔧 TEST DEL INPUTVALIDATOR CORREGIDO');
console.log('===================================\n');

// Simular InputValidator corregido
class InputValidator {
  // Caracteres SQL peligrosos - Versión más específica y menos agresiva
  static SQL_INJECTION_PATTERNS = [
    // Solo palabras SQL completas al inicio de línea o después de espacios
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\s)/gi,
    // Caracteres realmente peligrosos en contexto SQL
    /(\s*;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION))/gi,
    // Comentarios SQL específicos
    /(\s*--\s*)/gi,
    /(\s*\/\*.*\*\/\s*)/gi,
    // Comillas seguidas de OR/AND (inyección típica)
    /('\s*(OR|AND)\s*')/gi,
    /('\s*(OR|AND)\s*\d)/gi
  ];

  // Validar nombre de usuario - Versión más permisiva
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    
    // Permitir letras, números, puntos, guiones y guiones bajos, 3-50 caracteres
    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    return usernameRegex.test(username);
  }

  // Detectar inyección SQL
  static containsSqlInjection(input) {
    if (!input || typeof input !== 'string') return false;
    
    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  // Validar datos de login - Versión menos restrictiva
  static validateLoginData(data) {
    const result = {
      isValid: true,
      sanitized: {},
      errors: []
    };

    // Validación básica de usuario
    if (!data.usuario || typeof data.usuario !== 'string') {
      result.isValid = false;
      result.errors.push('usuario: Usuario requerido');
    } else {
      const usuario = data.usuario.trim();
      
      // Solo verificar longitud y caracteres básicos para login
      if (usuario.length < 3 || usuario.length > 50) {
        result.isValid = false;
        result.errors.push('usuario: Usuario debe tener entre 3 y 50 caracteres');
      } else if (!/^[a-zA-Z0-9._-]+$/.test(usuario)) {
        result.isValid = false;
        result.errors.push('usuario: Usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
      } else {
        result.sanitized.usuario = usuario;
      }
    }

    // Validación básica de contraseña
    if (!data.contrasena || typeof data.contrasena !== 'string') {
      result.isValid = false;
      result.errors.push('contrasena: Contraseña requerida');
    } else {
      const contrasena = data.contrasena;
      
      // Solo verificar longitud para login (no formato)
      if (contrasena.length < 1 || contrasena.length > 100) {
        result.isValid = false;
        result.errors.push('contrasena: Contraseña debe tener entre 1 y 100 caracteres');
      } else {
        result.sanitized.contrasena = contrasena;
      }
    }

    return result;
  }
}

// Test de credenciales
function testCredentials() {
  console.log('🧪 Probando credenciales con InputValidator corregido...\n');
  
  const testCases = [
    { usuario: 'admin', contrasena: 'admin123', description: 'Admin básico' },
    { usuario: 'superadmin', contrasena: 'admin123', description: 'Super admin' },
    { usuario: 'test', contrasena: 'test123', description: 'Usuario test' },
    { usuario: 'user.name', contrasena: 'password', description: 'Usuario con punto' },
    { usuario: 'user-name', contrasena: 'password', description: 'Usuario con guión' },
    { usuario: 'user_name', contrasena: 'password', description: 'Usuario con guión bajo' },
    { usuario: 'SELECT * FROM users', contrasena: 'hack', description: 'Inyección SQL real' },
    { usuario: "admin'; DROP TABLE users; --", contrasena: 'hack', description: 'Inyección SQL peligrosa' },
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Usuario: "${testCase.usuario}"`);
    console.log(`   Contraseña: "${testCase.contrasena}"`);
    
    // Test de validación de username individual
    const usernameValid = InputValidator.isValidUsername(testCase.usuario);
    console.log(`   Username válido: ${usernameValid ? '✅' : '❌'}`);
    
    // Test de inyección SQL
    const hasSqlInjection = InputValidator.containsSqlInjection(testCase.usuario);
    console.log(`   Contiene SQL injection: ${hasSqlInjection ? '❌ SÍ' : '✅ NO'}`);
    
    // Test completo de login
    const loginValidation = InputValidator.validateLoginData({
      usuario: testCase.usuario,
      contrasena: testCase.contrasena
    });
    
    console.log(`   Login válido: ${loginValidation.isValid ? '✅ SÍ' : '❌ NO'}`);
    
    if (!loginValidation.isValid) {
      console.log(`   Errores: ${loginValidation.errors.join(', ')}`);
    } else {
      console.log(`   ✅ Credenciales aceptadas`);
    }
    
    console.log('   ----------------------------------------');
  });
  
  console.log('\n🎯 RESULTADO ESPERADO:');
  console.log('======================');
  console.log('✅ admin/admin123 → Válido');
  console.log('✅ superadmin/admin123 → Válido (CORREGIDO)');
  console.log('✅ test/test123 → Válido');
  console.log('✅ user.name/password → Válido');
  console.log('✅ user-name/password → Válido');
  console.log('✅ user_name/password → Válido');
  console.log('❌ SELECT * FROM users → Inválido (inyección SQL)');
  console.log('❌ admin\'; DROP TABLE → Inválido (inyección SQL)');
}

testCredentials();
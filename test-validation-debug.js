#!/usr/bin/env node

/**
 * Test para debuggear la validación que está fallando
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 DEBUG DE VALIDACIÓN');
console.log('======================\n');

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

// Test de validación
function testValidation() {
  console.log('🧪 Probando validación con diferentes credenciales...\n');
  
  const credentialsToTest = [
    { usuario: 'admin', contrasena: 'admin123' },
    { usuario: 'test', contrasena: 'test123' },
    { usuario: 'user123', contrasena: 'password' },
    { usuario: 'a', contrasena: 'short' }, // Usuario muy corto
    { usuario: 'admin@test', contrasena: 'admin123' }, // Usuario con @
    { usuario: 'admin-user', contrasena: 'admin123' }, // Usuario con -
  ];
  
  credentialsToTest.forEach((creds, index) => {
    console.log(`${index + 1}. Probando: ${creds.usuario} / ${creds.contrasena}`);
    
    // Test individual de usuario
    const userValidation = InputValidator.validateInput(creds.usuario, 'username');
    console.log(`   Usuario válido: ${userValidation.isValid}`);
    if (!userValidation.isValid) {
      console.log(`   Errores usuario: ${userValidation.errors.join(', ')}`);
    }
    
    // Test individual de contraseña
    const passValidation = InputValidator.validateInput(creds.contrasena, 'text');
    console.log(`   Contraseña válida: ${passValidation.isValid}`);
    if (!passValidation.isValid) {
      console.log(`   Errores contraseña: ${passValidation.errors.join(', ')}`);
    }
    
    // Test completo
    const loginValidation = InputValidator.validateLoginData(creds);
    console.log(`   Login válido: ${loginValidation.isValid}`);
    if (!loginValidation.isValid) {
      console.log(`   Errores login: ${loginValidation.errors.join(', ')}`);
    }
    
    console.log('   ----------------------------------------');
  });
  
  console.log('\n🎯 ANÁLISIS:');
  console.log('============');
  console.log('Si "admin" falla la validación de usuario, el problema está en el regex');
  console.log('Regex actual: /^[a-zA-Z0-9_]{3,30}$/');
  console.log('- Permite: letras, números, guiones bajos');
  console.log('- Longitud: 3-30 caracteres');
  console.log('- NO permite: guiones, arrobas, espacios, caracteres especiales');
}

testValidation();
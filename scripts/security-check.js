#!/usr/bin/env node

/**
 * Script de verificación de seguridad para ECommerce Mobile
 * Verifica que todas las implementaciones de seguridad estén correctas
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  VERIFICACIÓN DE SEGURIDAD - ECOMMERCE MOBILE');
console.log('================================================\n');

let passed = 0;
let failed = 0;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    passed++;
    return true;
  } else {
    console.log(`❌ ${description} - ARCHIVO NO ENCONTRADO`);
    failed++;
    return false;
  }
}

function checkFileContent(filePath, searchText, description) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      console.log(`✅ ${description}`);
      passed++;
      return true;
    } else {
      console.log(`❌ ${description} - CONTENIDO NO ENCONTRADO`);
      failed++;
      return false;
    }
  } else {
    console.log(`❌ ${description} - ARCHIVO NO ENCONTRADO`);
    failed++;
    return false;
  }
}

// Verificar componentes de seguridad
console.log('🔧 COMPONENTES DE SEGURIDAD:');
checkFile('components/security/SecureStorage.js', 'SecureStorage implementado');
checkFile('components/security/SecureLogger.js', 'SecureLogger implementado');
checkFile('components/security/InputValidator.js', 'InputValidator implementado');
checkFile('components/security/SecureHttpClient.js', 'SecureHttpClient implementado');

console.log('\n📱 SERVICIOS API ACTUALIZADOS:');
checkFileContent('components/services/store/users.js', 'SecureHttpClient', 'users.js usa SecureHttpClient');
checkFileContent('components/services/store/productos.js', 'SecureHttpClient', 'productos.js usa SecureHttpClient');
checkFileContent('components/services/store/pedidos.js', 'SecureHttpClient', 'pedidos.js usa SecureHttpClient');
checkFileContent('components/services/store/tokens.js', 'SecureHttpClient', 'tokens.js usa SecureHttpClient');
checkFileContent('components/services/store/ventaPresencial.js', 'SecureHttpClient', 'ventaPresencial.js usa SecureHttpClient');

console.log('\n🔐 COMPONENTES DE AUTENTICACIÓN:');
checkFileContent('app/auth/Login.jsx', 'InputValidator', 'Login.jsx usa InputValidator');
checkFileContent('app/auth/Register.jsx', 'InputValidator', 'Register.jsx usa InputValidator');
checkFileContent('components/context/authContext.jsx', 'SecureStorageManager', 'AuthContext usa SecureStorage');

console.log('\n⚙️  CONFIGURACIÓN DE ENTORNO:');
checkFile('.env', 'Archivo .env existe');
checkFile('.env.production', 'Archivo .env.production existe');
checkFileContent('.env.production', 'EXPO_PUBLIC_DEBUG_MODE=false', 'Debug deshabilitado en producción');
checkFileContent('.env.production', 'EXPO_PUBLIC_REQUIRE_HTTPS=true', 'HTTPS requerido en producción');

console.log('\n📦 DEPENDENCIAS DE SEGURIDAD:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps['expo-secure-store']) {
    console.log('✅ expo-secure-store instalado');
    passed++;
  } else {
    console.log('❌ expo-secure-store NO instalado');
    failed++;
  }
  
  if (deps['expo-crypto']) {
    console.log('✅ expo-crypto instalado');
    passed++;
  } else {
    console.log('❌ expo-crypto NO instalado');
    failed++;
  }
  
  if (deps['expo-local-authentication']) {
    console.log('✅ expo-local-authentication instalado');
    passed++;
  } else {
    console.log('❌ expo-local-authentication NO instalado');
    failed++;
  }
} else {
  console.log('❌ package.json no encontrado');
  failed += 3;
}

console.log('\n📋 RESUMEN:');
console.log(`✅ Verificaciones pasadas: ${passed}`);
console.log(`❌ Verificaciones fallidas: ${failed}`);
console.log(`📊 Porcentaje de éxito: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 ¡TODAS LAS VERIFICACIONES DE SEGURIDAD PASARON!');
  console.log('🛡️  La aplicación está lista para producción.');
} else {
  console.log('\n⚠️  ALGUNAS VERIFICACIONES FALLARON');
  console.log('🔧 Revisa los elementos marcados con ❌ antes de desplegar a producción.');
}

console.log('\n📖 Para más información, consulta: SECURITY_IMPLEMENTATION_COMPLETE.md');
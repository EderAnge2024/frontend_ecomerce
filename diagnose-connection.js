// Diagnóstico completo de conectividad
import { readFileSync } from 'fs';

// Leer configuración del .env
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    console.log('⚠️ No se pudo leer .env');
    return {};
  }
}

const env = loadEnv();
const API_BASE_URL = env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

console.log('🔍 DIAGNÓSTICO COMPLETO DE CONECTIVIDAD');
console.log('=====================================\n');

console.log('📋 Configuración actual:');
console.log(`   API_BASE_URL: ${API_BASE_URL}`);
console.log(`   DEBUG_MODE: ${env.EXPO_PUBLIC_DEBUG_MODE}`);
console.log(`   REQUIRE_HTTPS: ${env.EXPO_PUBLIC_REQUIRE_HTTPS}\n`);

// Test 1: Ping básico al servidor
async function testServerPing() {
  console.log('🏓 Test 1: Ping al servidor...');
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await fetch(baseUrl, { 
      method: 'GET',
      timeout: 5000 
    });
    console.log(`   ✅ Servidor responde: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Servidor no responde: ${error.message}`);
    return false;
  }
}

// Test 2: Health check
async function testHealthCheck() {
  console.log('\n🏥 Test 2: Health check...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health check OK:', data.status);
      return true;
    } else {
      console.log(`   ❌ Health check falló: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Health check error: ${error.message}`);
    return false;
  }
}

// Test 3: Productos endpoint
async function testProductos() {
  console.log('\n📦 Test 3: Endpoint de productos...');
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Productos endpoint OK');
      console.log(`   📊 Productos encontrados: ${data.productos ? data.productos.length : 0}`);
      
      if (data.productos && data.productos.length > 0) {
        const producto = data.productos[0];
        console.log('   📝 Ejemplo de producto:');
        console.log(`      - ID: ${producto.id_producto || producto.id}`);
        console.log(`      - Título: ${producto.title}`);
        console.log(`      - Precio: ${producto.price}`);
        console.log(`      - Stock: ${producto.stock}`);
      } else {
        console.log('   ⚠️ No hay productos en la base de datos');
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    
    if (error.message.includes('CORS')) {
      console.log('   💡 Posible problema de CORS - verificar configuración del backend');
    } else if (error.message.includes('fetch')) {
      console.log('   💡 Problema de conectividad - verificar IP y puerto');
    }
    return false;
  }
}

// Test 4: Productos combinados
async function testProductosCombinados() {
  console.log('\n🔄 Test 4: Productos combinados...');
  try {
    const response = await fetch(`${API_BASE_URL}/productos/combinados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Productos combinados OK');
      console.log(`   📊 Total: ${data.productos ? data.productos.length : 0}`);
      if (data.stats) {
        console.log(`   📊 De BD: ${data.stats.database}`);
        console.log(`   📊 De API externa: ${data.stats.api}`);
      }
      return true;
    } else {
      console.log(`   ❌ Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 5: Login endpoint
async function testLogin() {
  console.log('\n🔐 Test 5: Login endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'test',
        contrasena: 'test'
      }),
      timeout: 5000
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ Login endpoint responde (credenciales incorrectas es normal)');
      return true;
    } else if (response.ok) {
      console.log('   ✅ Login endpoint OK');
      return true;
    } else {
      console.log(`   ❌ Error inesperado: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Ejecutar todos los tests
async function runDiagnosis() {
  const results = {
    serverPing: await testServerPing(),
    healthCheck: await testHealthCheck(),
    productos: await testProductos(),
    productosCombinados: await testProductosCombinados(),
    login: await testLogin()
  };
  
  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('========================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
  });
  
  console.log(`\n🎯 Éxito: ${passed}/${total} tests pasaron`);
  
  if (passed === total) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('La conectividad está funcionando correctamente.');
  } else {
    console.log('\n🔧 RECOMENDACIONES:');
    
    if (!results.serverPing) {
      console.log('• Verificar que el backend esté ejecutándose');
      console.log('• Verificar la IP en .env');
      console.log('• Verificar firewall y configuración de red');
    }
    
    if (!results.productos) {
      console.log('• Verificar configuración de CORS en el backend');
      console.log('• Verificar que la base de datos esté conectada');
      console.log('• Revisar logs del backend para errores');
    }
    
    console.log('\n💡 Pasos siguientes:');
    console.log('1. Reiniciar el backend: cd backend && npm start');
    console.log('2. Verificar logs del backend');
    console.log('3. Verificar configuración de CORS');
    console.log('4. Probar con diferentes IPs si es necesario');
  }
}

runDiagnosis().catch(console.error);
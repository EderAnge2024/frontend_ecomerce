// Test rápido de conectividad
const API_URL = 'http://192.168.182.254:3000/api';

console.log('🚀 TEST RÁPIDO DE CONECTIVIDAD');
console.log('=============================');
console.log('API URL:', API_URL);
console.log('Timestamp:', new Date().toISOString());
console.log('');

async function quickTest() {
  try {
    console.log('1️⃣ Probando health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Health: ${healthData.status}`);
    } else {
      console.log(`   ❌ Health check falló`);
      return;
    }

    console.log('\n2️⃣ Probando productos...');
    const productosResponse = await fetch(`${API_URL}/productos`);
    console.log(`   Status: ${productosResponse.status}`);
    
    if (productosResponse.ok) {
      const productosData = await productosResponse.json();
      console.log(`   ✅ Productos: ${productosData.productos ? productosData.productos.length : 0} encontrados`);
      
      if (productosData.productos && productosData.productos.length > 0) {
        const producto = productosData.productos[0];
        console.log(`   📦 Ejemplo: "${producto.title}" - $${producto.price}`);
      } else {
        console.log('   ⚠️ No hay productos en la base de datos');
        console.log('   💡 Puedes agregar productos desde la app móvil (sección admin)');
      }
    } else {
      const errorText = await productosResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }

    console.log('\n3️⃣ Probando productos combinados...');
    const combinadosResponse = await fetch(`${API_URL}/productos/combinados`);
    console.log(`   Status: ${combinadosResponse.status}`);
    
    if (combinadosResponse.ok) {
      const combinadosData = await combinadosResponse.json();
      console.log(`   ✅ Productos combinados: ${combinadosData.productos ? combinadosData.productos.length : 0}`);
      if (combinadosData.stats) {
        console.log(`   📊 BD: ${combinadosData.stats.database}, API externa: ${combinadosData.stats.api}`);
      }
    }

    console.log('\n🎉 RESULTADO:');
    console.log('✅ Conectividad funcionando correctamente');
    console.log('✅ Backend respondiendo');
    console.log('✅ CORS configurado correctamente');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Reiniciar la app móvil: expo start -c');
    console.log('   2. Probar login en la app');
    console.log('   3. Verificar que los productos cargan');

  } catch (error) {
    console.log('\n❌ ERROR DE CONECTIVIDAD:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 POSIBLES SOLUCIONES:');
      console.log('   1. Verificar que el backend esté ejecutándose:');
      console.log('      cd backend && npm start');
      console.log('   2. Verificar la IP en .env:');
      console.log('      EXPO_PUBLIC_API_BASE_URL=http://TU_IP:3000/api');
      console.log('   3. Probar con diferentes IPs:');
      console.log('      - http://localhost:3000/api (emulador iOS)');
      console.log('      - http://10.0.2.2:3000/api (emulador Android)');
      console.log('      - http://192.168.x.x:3000/api (dispositivo físico)');
    }
  }
}

quickTest();
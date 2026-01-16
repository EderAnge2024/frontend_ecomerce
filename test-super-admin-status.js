// Script para verificar el estado actual del usuario admin
import fetch from 'node-fetch';

const API_BASE_URL = 'http://192.168.182.254:3000/api';

async function testSuperAdminStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE SUPER ADMINISTRADOR');
  console.log('='.repeat(45));
  
  try {
    // Hacer login como admin
    console.log('1️⃣ Haciendo login como admin...');
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
    
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }
    
    const user = loginData.data?.user || loginData.user;
    console.log('✅ Login exitoso');
    console.log('');
    console.log('👤 INFORMACIÓN DEL USUARIO:');
    console.log(`   ID: ${user.id_usuario}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Usuario: ${user.usuario}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Super Admin: ${user.es_super_admin ? '✅ SÍ' : '❌ NO'}`);
    console.log('');
    
    if (user.es_super_admin) {
      console.log('🎉 ¡El usuario ya es super administrador!');
      console.log('🔍 AuthStateDebug debería ser visible en la app móvil');
    } else {
      console.log('⚠️ El usuario NO es super administrador');
      console.log('🔍 AuthStateDebug NO será visible en la app móvil');
      console.log('');
      console.log('💡 PARA SOLUCIONARLO:');
      console.log('Ejecuta esta consulta SQL en tu base de datos PostgreSQL:');
      console.log('');
      console.log("UPDATE usuarios SET es_super_admin = true WHERE usuario = 'admin';");
      console.log('');
      console.log('O si tienes acceso a psql:');
      console.log("psql -d tu_base_de_datos -c \"UPDATE usuarios SET es_super_admin = true WHERE usuario = 'admin';\"");
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Ejecutar el test
testSuperAdminStatus();
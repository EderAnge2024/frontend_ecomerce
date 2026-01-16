// Script para actualizar el usuario admin a super administrador
import fetch from 'node-fetch';

const API_BASE_URL = 'http://192.168.182.254:3000/api';

async function updateAdminToSuperAdmin() {
  console.log('🔧 ACTUALIZANDO USUARIO ADMIN A SUPER ADMINISTRADOR');
  console.log('='.repeat(50));
  
  try {
    // Primero hacer login como admin para obtener el token
    console.log('1️⃣ Haciendo login como admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        contrasena: 'admin123' // Contraseña por defecto del admin
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }
    
    console.log('✅ Login exitoso');
    const token = loginData.data?.tokens?.accessToken || loginData.tokens?.accessToken;
    const userId = loginData.data?.user?.id_usuario || loginData.user?.id_usuario;
    
    if (!token || !userId) {
      console.error('❌ No se pudo obtener token o ID de usuario');
      return;
    }
    
    console.log('📝 ID de usuario:', userId);
    
    // Ahora actualizar el campo es_super_admin directamente en la base de datos
    // Como no tenemos un endpoint específico, usaremos una consulta SQL directa
    console.log('2️⃣ Actualizando campo es_super_admin...');
    
    // Hacer una consulta SQL directa usando el endpoint de usuarios
    const updateResponse = await fetch(`${API_BASE_URL}/usuarios/update-super-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_usuario: userId,
        es_super_admin: true
      })
    });
    
    if (updateResponse.status === 404) {
      console.log('⚠️ Endpoint específico no encontrado, intentando método alternativo...');
      
      // Método alternativo: crear un endpoint temporal o usar consulta directa
      console.log('3️⃣ Usando método alternativo...');
      console.log('💡 Necesitas ejecutar esta consulta SQL manualmente en tu base de datos:');
      console.log('');
      console.log('UPDATE usuarios SET es_super_admin = true WHERE usuario = \'admin\';');
      console.log('');
      console.log('O puedes usar el siguiente comando en psql:');
      console.log('psql -d tu_base_de_datos -c "UPDATE usuarios SET es_super_admin = true WHERE usuario = \'admin\';"');
      
      return;
    }
    
    const updateData = await updateResponse.json();
    
    if (updateData.success) {
      console.log('✅ Usuario actualizado exitosamente');
      console.log('👑 El usuario admin ahora es super administrador');
      console.log('🔍 AuthStateDebug ahora será visible para este usuario');
    } else {
      console.error('❌ Error actualizando usuario:', updateData.message);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('');
    console.log('💡 SOLUCIÓN MANUAL:');
    console.log('Ejecuta esta consulta SQL en tu base de datos PostgreSQL:');
    console.log('');
    console.log('UPDATE usuarios SET es_super_admin = true WHERE usuario = \'admin\';');
    console.log('');
  }
}

// Ejecutar el script
updateAdminToSuperAdmin();
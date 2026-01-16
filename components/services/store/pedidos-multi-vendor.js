import BASE_URL from '../apiEcomerce';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ SERVICIOS PARA PEDIDOS MULTI-VENDEDOR ============

/**
 * Procesar compra con división automática por vendedor
 * @param {Object} compraData - Datos de la compra
 * @param {number} compraData.id_usuario - ID del cliente
 * @param {Array} compraData.productos - Array de productos del carrito
 * @param {number} compraData.id_ubicacion - ID de la ubicación de envío
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export const procesarCompraMultiVendedor = async (compraData) => {
  try {
    // Obtener token de autenticación - REQUERIDO
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido para procesar compras');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🛒 Enviando compra multi-vendedor:', compraData);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/pedidos/multi-vendor`, {
      method: 'POST',
      headers,
      body: JSON.stringify(compraData),
    });

    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Compra multi-vendedor procesada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en procesarCompraMultiVendedor:', error);
    throw error;
  }
};

/**
 * Obtener preview de cómo se dividirá un carrito por vendedores
 * @param {Array} productos - Array de productos del carrito
 * @returns {Promise<Object>} Preview de la división
 */
export const previewDivisionPorVendedor = async (productos) => {
  try {
    // Obtener token de autenticación - REQUERIDO
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🛒 Obteniendo preview de división:', productos);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/pedidos/preview-division`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productos }),
    });

    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en previewDivisionPorVendedor:', error);
    throw error;
  }
};

/**
 * Obtener pedidos de un vendedor específico
 * @param {number} id_vendedor - ID del vendedor
 * @returns {Promise<Object>} Lista de pedidos del vendedor
 */
export const getPedidosByVendedor = async (id_vendedor) => {
  try {
    // Obtener token de autenticación - REQUERIDO (solo admins)
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🛒 Obteniendo pedidos del vendedor:', id_vendedor);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/pedidos/vendedor/${id_vendedor}`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getPedidosByVendedor:', error);
    throw error;
  }
};

/**
 * Obtener resumen completo de un pedido maestro
 * @param {number} id_pedido_maestro - ID del pedido maestro
 * @returns {Promise<Object>} Resumen del pedido maestro
 */
export const getResumenPedidoMaestro = async (id_pedido_maestro) => {
  try {
    // Obtener token de autenticación - REQUERIDO
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🛒 Obteniendo resumen del pedido maestro:', id_pedido_maestro);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/pedidos/maestro/${id_pedido_maestro}`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getResumenPedidoMaestro:', error);
    throw error;
  }
};

/**
 * Obtener notificaciones de pedidos para un usuario
 * @param {number} id_usuario - ID del usuario
 * @param {boolean} solo_no_leidas - Si solo obtener las no leídas
 * @returns {Promise<Object>} Lista de notificaciones
 */
export const getNotificacionesPedidos = async (id_usuario, solo_no_leidas = false) => {
  try {
    // Obtener token de autenticación - REQUERIDO + ownership
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const url = `${BASE_URL}/pedidos/notificaciones/${id_usuario}${solo_no_leidas ? '?solo_no_leidas=true' : ''}`;
    
    console.log('🛒 Obteniendo notificaciones:', { id_usuario, solo_no_leidas });
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(url, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getNotificacionesPedidos:', error);
    throw error;
  }
};

/**
 * Marcar notificación como leída
 * @param {number} id_notificacion - ID de la notificación
 * @returns {Promise<Object>} Notificación actualizada
 */
export const marcarNotificacionLeida = async (id_notificacion) => {
  try {
    // Obtener token de autenticación - REQUERIDO
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🛒 Marcando notificación como leída:', id_notificacion);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/pedidos/notificaciones/${id_notificacion}/leer`, {
      method: 'PUT',
      headers,
    });

    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en marcarNotificacionLeida:', error);
    throw error;
  }
};
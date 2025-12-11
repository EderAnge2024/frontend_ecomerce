import BASE_URL from '../apiEcomerce';

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
    console.log('🛒 Enviando compra multi-vendedor:', compraData);
    
    const response = await fetch(`${BASE_URL}/pedidos/multi-vendor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compraData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al procesar la compra');
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
    const response = await fetch(`${BASE_URL}/pedidos/preview-division`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productos }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al generar preview');
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
    const response = await fetch(`${BASE_URL}/pedidos/vendedor/${id_vendedor}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener pedidos del vendedor');
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
    const response = await fetch(`${BASE_URL}/pedidos/maestro/${id_pedido_maestro}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener resumen del pedido maestro');
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
    const url = `${BASE_URL}/pedidos/notificaciones/${id_usuario}${solo_no_leidas ? '?solo_no_leidas=true' : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener notificaciones');
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
    const response = await fetch(`${BASE_URL}/pedidos/notificaciones/${id_notificacion}/leer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al marcar notificación como leída');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en marcarNotificacionLeida:', error);
    throw error;
  }
};
import SecureHttpClient from '../../security/SecureHttpClient';
import SecureLogger from '../../security/SecureLogger';
import { ENV_CONFIG } from '../../../config/env';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// ============ SERVICIOS DE PEDIDOS ============
// Funciones para interactuar con la API de pedidos desde el frontend

/**
 * Crear un nuevo pedido
 * @param {Object} pedidoData - Datos del pedido { id_usuario, total, id_ubicacion }
 * @returns {Promise<Object>} Respuesta con el pedido creado
 */
export const createPedido = async (pedidoData) => {
  try {
    // Validar datos de entrada
    if (!pedidoData.id_usuario || isNaN(parseInt(pedidoData.id_usuario))) {
      throw new Error('ID de usuario inválido');
    }
    
    if (!pedidoData.total || isNaN(parseFloat(pedidoData.total)) || parseFloat(pedidoData.total) <= 0) {
      throw new Error('Total del pedido inválido');
    }
    
    SecureLogger.debug('Creando pedido');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/pedidos`, pedidoData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en createPedido', error);
    throw error;
  }
};

/**
 * Obtener todos los pedidos del sistema
 * Uso: Super administrador
 * @returns {Promise<Object>} Respuesta con array de pedidos
 */
export const getAllPedidos = async () => {
  try {
    SecureLogger.debug('Obteniendo todos los pedidos');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/pedidos`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en getAllPedidos', error);
    throw error;
  }
};

/**
 * Obtener un pedido específico por ID
 * @param {number} id - ID del pedido
 * @returns {Promise<Object>} Respuesta con el pedido
 */
export const getPedidoById = async (id) => {
  try {
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de pedido inválido');
    }
    
    SecureLogger.debug('Obteniendo pedido por ID');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/pedidos/${id}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en getPedidoById', error);
    throw error;
  }
};

/**
 * Obtener pedidos de un usuario (cliente)
 * Uso: Cliente ve su historial de compras
 * @param {number} id_usuario - ID del usuario
 * @returns {Promise<Object>} Respuesta con array de pedidos del usuario
 */
export const getPedidosByUser = async (id_usuario) => {
  try {
    // Validar ID de usuario
    if (!id_usuario || isNaN(parseInt(id_usuario))) {
      throw new Error('ID de usuario inválido');
    }
    
    SecureLogger.debug('Obteniendo pedidos del usuario');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/pedidos/usuario/${id_usuario}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en getPedidosByUser', error);
    throw error;
  }
};

/**
 * Obtener pedidos que contienen productos de un administrador
 * Uso: Administrador ve solo pedidos con sus productos
 * @param {number} id_admin - ID del administrador
 * @returns {Promise<Object>} Respuesta con array de pedidos filtrados
 */
export const getPedidosByAdmin = async (id_admin) => {
  try {
    // Validar ID de admin
    if (!id_admin || isNaN(parseInt(id_admin))) {
      throw new Error('ID de administrador inválido');
    }
    
    SecureLogger.debug('Obteniendo pedidos del admin');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/pedidos/admin/${id_admin}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en getPedidosByAdmin', error);
    throw error;
  }
};

/**
 * Actualizar un pedido (total y/o estado)
 * @param {number} id - ID del pedido
 * @param {Object} pedidoData - Datos a actualizar { total, estado }
 * @returns {Promise<Object>} Respuesta con el pedido actualizado
 */
export const updatePedido = async (id, pedidoData) => {
  try {
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de pedido inválido');
    }
    
    // Validar datos si están presentes
    if (pedidoData.total && (isNaN(parseFloat(pedidoData.total)) || parseFloat(pedidoData.total) <= 0)) {
      throw new Error('Total inválido');
    }
    
    if (pedidoData.estado && !['Pendiente', 'En proceso', 'Entregado'].includes(pedidoData.estado)) {
      throw new Error('Estado inválido');
    }
    
    SecureLogger.debug('Actualizando pedido');
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/pedidos/${id}`, pedidoData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en updatePedido', error);
    throw error;
  }
};

/**
 * Actualizar solo el estado de un pedido
 * Estados válidos: 'Pendiente', 'En proceso', 'Entregado'
 * @param {number} id - ID del pedido
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object>} Respuesta con el pedido actualizado
 */
export const updatePedidoEstado = async (id, estado) => {
  try {
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de pedido inválido');
    }
    
    // Validar estado
    if (!estado || !['Pendiente', 'En proceso', 'Entregado'].includes(estado)) {
      throw new Error('Estado inválido. Debe ser: Pendiente, En proceso o Entregado');
    }
    
    SecureLogger.debug('Actualizando estado del pedido');
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/pedidos/${id}/estado`, { estado });
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en updatePedidoEstado', error);
    throw error;
  }
};

/**
 * Eliminar un pedido
 * @param {number} id - ID del pedido
 * @returns {Promise<Object>} Respuesta con el pedido eliminado
 */
export const deletePedido = async (id) => {
  try {
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de pedido inválido');
    }
    
    SecureLogger.debug('Eliminando pedido');
    
    const response = await SecureHttpClient.delete(`${API_BASE_URL}/pedidos/${id}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en deletePedido', error);
    throw error;
  }
};

// ============ SERVICIOS DE PEDIDO_PRODUCTO ============
// Funciones para gestionar los productos dentro de un pedido

/**
 * Crear una relación pedido-producto
 * @param {Object} pedidoProductoData - Datos { id_pedido, id_producto, cantidad, precio }
 * @returns {Promise<Object>} Respuesta con la relación creada
 */
export const createPedidoProducto = async (pedidoProductoData) => {
  try {
    // Validar datos de entrada
    if (!pedidoProductoData.id_pedido || isNaN(parseInt(pedidoProductoData.id_pedido))) {
      throw new Error('ID de pedido inválido');
    }
    
    if (!pedidoProductoData.id_producto || isNaN(parseInt(pedidoProductoData.id_producto))) {
      throw new Error('ID de producto inválido');
    }
    
    if (!pedidoProductoData.cantidad || isNaN(parseInt(pedidoProductoData.cantidad)) || parseInt(pedidoProductoData.cantidad) <= 0) {
      throw new Error('Cantidad inválida');
    }
    
    if (!pedidoProductoData.precio || isNaN(parseFloat(pedidoProductoData.precio)) || parseFloat(pedidoProductoData.precio) <= 0) {
      throw new Error('Precio inválido');
    }
    
    SecureLogger.debug('Creando pedido-producto');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/pedido-productos`, pedidoProductoData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en createPedidoProducto', error);
    throw error;
  }
};

/**
 * Obtener todos los productos de un pedido específico
 * @param {number} id_pedido - ID del pedido
 * @returns {Promise<Object>} Respuesta con array de productos del pedido
 */
export const getProductosByPedido = async (id_pedido) => {
  try {
    // Validar ID de pedido
    if (!id_pedido || isNaN(parseInt(id_pedido))) {
      throw new Error('ID de pedido inválido');
    }
    
    SecureLogger.debug('Obteniendo productos del pedido');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/pedido-productos/pedido/${id_pedido}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    SecureLogger.error('Error en getProductosByPedido', error);
    throw error;
  }
};
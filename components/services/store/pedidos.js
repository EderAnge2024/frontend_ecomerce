import BASE_URL from '../apiEcomerce';

// ============ SERVICIOS DE PEDIDOS ============
// Funciones para interactuar con la API de pedidos desde el frontend

/**
 * Crear un nuevo pedido
 * @param {Object} pedidoData - Datos del pedido { id_usuario, total, id_ubicacion }
 * @returns {Promise<Object>} Respuesta con el pedido creado
 */
export const createPedido = async (pedidoData) => {
  try {
    const response = await fetch(`${BASE_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createPedido:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllPedidos:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getPedidoById:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/usuario/${id_usuario}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getPedidosByUser:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/admin/${id_admin}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getPedidosByAdmin:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updatePedido:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updatePedidoEstado:', error);
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
    const response = await fetch(`${BASE_URL}/pedidos/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deletePedido:', error);
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
    const response = await fetch(`${BASE_URL}/pedido-productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoProductoData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createPedidoProducto:', error)
    throw error
  }
}

/**
 * Obtener todos los productos de un pedido específico
 * @param {number} id_pedido - ID del pedido
 * @returns {Promise<Object>} Respuesta con array de productos del pedido
 */
export const getProductosByPedido = async (id_pedido) => {
  try {
    const response = await fetch(`${BASE_URL}/pedido-productos/pedido/${id_pedido}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductosByPedido:', error);
    throw error;
  }
};
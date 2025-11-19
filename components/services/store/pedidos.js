import BASE_URL from '../apiEcomerce';

// ============ CRUD PEDIDOS ============

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

// ============ CRUD PEDIDO_PRODUCTO ============

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
    console.error('Error en createPedidoProducto:', error);
    throw error;
  }
};

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

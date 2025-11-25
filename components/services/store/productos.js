import BASE_URL from '../apiEcomerce';

// ============ CRUD PRODUCTOS ============

export const createProducto = async (productoData) => {
  try {
    const response = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productoData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createProducto:', error);
    throw error;
  }
};

export const getAllProductos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/productos`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllProductos:', error);
    throw error;
  }
};

export const getProductoById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductoById:', error);
    throw error;
  }
};

export const getProductosByUser = async (id_usuario) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/usuario/${id_usuario}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductosByUser:', error);
    throw error;
  }
};

export const getProductosByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/categoria/${category}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductosByCategory:', error);
    throw error;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productoData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateProducto:', error);
    throw error;
  }
};

export const deleteProducto = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteProducto:', error);
    throw error;
  }
};

// ============ PRODUCTOS COMBINADOS (BD + API) ============

export const getProductosCombinados = async () => {
  try {
    const response = await fetch(`${BASE_URL}/productos/combinados`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductosCombinados:', error);
    throw error;
  }
};

export const getProductosDatabase = async () => {
  try {
    const response = await fetch(`${BASE_URL}/productos/database`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProductosDatabase:', error);
    throw error;
  }
};

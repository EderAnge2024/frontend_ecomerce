import BASE_URL from '../apiEcomerce';

// ============ CRUD UBICACIONES ============

export const createUbicacion = async (ubicacionData) => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ubicacionData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createUbicacion:', error);
    throw error;
  }
};

export const getAllUbicaciones = async () => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllUbicaciones:', error);
    throw error;
  }
};

export const getUbicacionById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getUbicacionById:', error);
    throw error;
  }
};

export const getUbicacionesByUser = async (id_usuario) => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones/usuario/${id_usuario}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getUbicacionesByUser:', error);
    throw error;
  }
};

export const updateUbicacion = async (id, ubicacionData) => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ubicacionData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateUbicacion:', error);
    throw error;
  }
};

export const deleteUbicacion = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteUbicacion:', error);
    throw error;
  }
};

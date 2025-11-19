import BASE_URL from '../apiEcomerce';

// ============ CRUD TOKENS ============

export const createToken = async (tokenData) => {
  try {
    const response = await fetch(`${BASE_URL}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createToken:', error);
    throw error;
  }
};

export const getAllTokens = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tokens`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllTokens:', error);
    throw error;
  }
};

export const getTokenById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getTokenById:', error);
    throw error;
  }
};

export const getTokensByUser = async (id_usuario) => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/usuario/${id_usuario}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getTokensByUser:', error);
    throw error;
  }
};

export const updateToken = async (id, tokenData) => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateToken:', error);
    throw error;
  }
};

export const deleteToken = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteToken:', error);
    throw error;
  }
};

export const cleanExpiredTokens = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tokens/clean/expired`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en cleanExpiredTokens:', error);
    throw error;
  }
};

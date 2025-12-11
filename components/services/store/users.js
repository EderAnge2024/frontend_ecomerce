import BASE_URL from '../apiEcomerce';

// ============ AUTENTICACIÓN ============

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

export const loginUser = async (usuario, contrasena) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, contrasena }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en loginUser:', error);
    throw error;
  }
};

// ============ CRUD USUARIOS ============

export const getAllUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getUserById:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteUser:', error);
    throw error;
  }
};

// ============ RECUPERACIÓN DE CONTRASEÑA ============

export const verifyEmail = async (correo) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    throw error;
  }
};

export const requestCode = async (correo) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/request-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en requestCode:', error);
    throw error;
  }
};

export const verifyCode = async (correo, codigo) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, codigo }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en verifyCode:', error);
    throw error;
  }
};

export const verifyCodeAndResetPassword = async (correo, codigo, nuevaContrasena) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/verify-code-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, codigo, nuevaContrasena }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en verifyCodeAndResetPassword:', error);
    throw error;
  }
};

// ============ ACTUALIZAR INFORMACIÓN DEL PERFIL ============

export const updateUserInfo = async (id, userData) => {
  try {
    const url = `${BASE_URL}/usuarios/update-info/${id}`;
    console.log('🌐 updateUserInfo service llamado');
    console.log('URL:', url);
    console.log('ID:', id);
    console.log('UserData:', userData);
    console.log('Body JSON:', JSON.stringify(userData));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response statusText:', response.statusText);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateUserInfo service:', error);
    throw error;
  }
};

// ============ ACTUALIZAR CREDENCIALES ============

export const updateCredentials = async (id, credentials) => {
  try {
    const url = `${BASE_URL}/usuarios/update-credentials/${id}`;
    console.log('🌐 updateCredentials service llamado');
    console.log('URL:', url);
    console.log('ID:', id);
    console.log('Credentials:', { usuario: credentials.usuario, contrasena: '***' });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response statusText:', response.statusText);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateCredentials service:', error);
    throw error;
  }
};

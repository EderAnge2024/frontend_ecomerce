import SecureHttpClient from '../../security/SecureHttpClient';
import { ENV_CONFIG } from '../../../config/env';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// ============ CRUD PRODUCTOS ============

export const createProducto = async (productoData) => {
  try {
    console.log('🛍️ Creando producto');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/productos`, productoData);
    const data = await response.json();
    
    console.log('✅ Producto creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error en createProducto:', error);
    throw error;
  }
};

export const getAllProductos = async () => {
  try {
    console.log('🛍️ Obteniendo todos los productos');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos`);
    const data = await response.json();
    
    console.log(`✅ ${data.productos ? data.productos.length : 0} productos obtenidos`);
    return data;
  } catch (error) {
    console.error('❌ Error en getAllProductos:', error);
    throw error;
  }
};

export const getProductoById = async (id) => {
  try {
    console.log('🛍️ Obteniendo producto por ID:', id);
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos/${id}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getProductoById:', error);
    throw error;
  }
};

export const getProductosByUser = async (id_usuario) => {
  try {
    console.log('🛍️ Obteniendo productos por usuario:', id_usuario);
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos/usuario/${id_usuario}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getProductosByUser:', error);
    throw error;
  }
};

export const getProductosByCategory = async (category) => {
  try {
    console.log('🛍️ Obteniendo productos por categoría:', category);
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos/categoria/${encodeURIComponent(category)}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getProductosByCategory:', error);
    throw error;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    console.log('🛍️ Actualizando producto:', id);
    
    const response = await SecureHttpClient.put(`${API_BASE_URL}/productos/${id}`, productoData);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en updateProducto:', error);
    throw error;
  }
};

export const deleteProducto = async (id) => {
  try {
    console.log('🛍️ Eliminando producto:', id);
    
    const response = await SecureHttpClient.delete(`${API_BASE_URL}/productos/${id}`);
    const data = await response.json();
    
    console.log('✅ Producto eliminado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error en deleteProducto:', error);
    throw error;
  }
};

// ============ PRODUCTOS COMBINADOS (BD + API) ============

export const getProductosCombinados = async () => {
  try {
    console.log('🛍️ Obteniendo productos combinados (BD + API externa)');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos/combinados`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${data.productos.length} productos combinados obtenidos`);
      if (data.stats) {
        console.log(`📊 BD: ${data.stats.database}, API externa: ${data.stats.api}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getProductosCombinados:', error);
    throw error;
  }
};

export const getProductosDatabase = async () => {
  try {
    console.log('🛍️ Obteniendo productos de base de datos');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/productos/database`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getProductosDatabase:', error);
    throw error;
  }
};

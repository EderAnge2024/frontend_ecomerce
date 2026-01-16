// Servicio para ventas presenciales (Punto de Venta)

import SecureHttpClient from '../../security/SecureHttpClient';
import SecureLogger from '../../security/SecureLogger';
import InputValidator from '../../security/InputValidator';
import { ENV_CONFIG } from '../../../config/env';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// Buscar productos disponibles para venta presencial
export const buscarProductosPresencial = async (filtros = {}) => {
  try {
    const { search = '', categoria = '', limit = 20, offset = 0 } = filtros;
    
    // Validar parámetros de entrada
    const searchValidation = search ? InputValidator.validateInput(search, 'text') : { isValid: true, sanitized: '' };
    const categoriaValidation = categoria ? InputValidator.validateInput(categoria, 'text') : { isValid: true, sanitized: '' };
    
    if (!searchValidation.isValid || !categoriaValidation.isValid) {
      throw new Error('Parámetros de búsqueda inválidos');
    }
    
    const params = new URLSearchParams();
    if (searchValidation.sanitized) params.append('search', searchValidation.sanitized);
    if (categoriaValidation.sanitized) params.append('categoria', categoriaValidation.sanitized);
    if (limit && limit > 0 && limit <= 100) params.append('limit', limit.toString());
    if (offset && offset >= 0) params.append('offset', offset.toString());
    
    const url = `${API_BASE_URL}/venta-presencial/productos?${params.toString()}`;
    
    SecureLogger.info('Buscando productos presencial');
    
    const response = await SecureHttpClient.get(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al buscar productos');
    }
    
    SecureLogger.success('Productos presencial obtenidos exitosamente');
    
    return {
      success: true,
      productos: data.data.productos || [],
      categorias: data.data.categorias || [],
      total: data.data.total || 0
    };
    
  } catch (error) {
    SecureLogger.error('Error buscando productos presencial', error);
    return {
      success: false,
      message: error.message || 'Error al buscar productos',
      productos: [],
      categorias: [],
      total: 0
    };
  }
};

// Crear venta presencial
export const crearVentaPresencial = async (datosVenta) => {
  try {
    // Validar datos de entrada
    if (!datosVenta || typeof datosVenta !== 'object') {
      throw new Error('Datos de venta inválidos');
    }

    // Validar campos requeridos
    if (!datosVenta.productos || !Array.isArray(datosVenta.productos) || datosVenta.productos.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }

    if (!datosVenta.total || isNaN(datosVenta.total) || datosVenta.total <= 0) {
      throw new Error('Total de venta inválido');
    }

    SecureLogger.info('Creando venta presencial');
    
    const response = await SecureHttpClient.post(`${API_BASE_URL}/venta-presencial/crear`, datosVenta);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear venta presencial');
    }
    
    if (data.success && data.data && data.data.pedido) {
      SecureLogger.success('Venta creada exitosamente');
      return {
        success: true,
        pedido: data.data.pedido,
        message: data.message
      };
    } else {
      throw new Error('Formato de respuesta incorrecto');
    }
    
  } catch (error) {
    SecureLogger.error('Error creando venta presencial', error);
    return {
      success: false,
      message: error.message || 'Error al crear venta presencial'
    };
  }
};

// Obtener resumen de ventas del día
export const obtenerResumenVentasDelDia = async () => {
  try {
    SecureLogger.info('Obteniendo resumen de ventas del día');
    
    const response = await SecureHttpClient.get(`${API_BASE_URL}/venta-presencial/resumen-dia`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener resumen de ventas');
    }
    
    SecureLogger.success('Resumen de ventas obtenido exitosamente');
    
    return {
      success: true,
      resumen: data.data.resumen,
      productos_mas_vendidos: data.data.productos_mas_vendidos,
      fecha: data.data.fecha
    };
    
  } catch (error) {
    SecureLogger.error('Error obteniendo resumen de ventas', error);
    return {
      success: false,
      message: error.message || 'Error al obtener resumen de ventas'
    };
  }
};
// Servicio para manejar comprobantes de ventas

import BASE_URL from '../apiEcomerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

// ============ COMPROBANTES ============

export const previsualizarComprobante = async (id_pedido) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📄 Previsualizando comprobante para pedido:', id_pedido);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(`${BASE_URL}/comprobantes/preview/${id_pedido}`, {
      headers
    });
    
    const data = await response.json();
    console.log('📡 Preview response status:', response.status);
    console.log('📦 Preview response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en previsualizarComprobante:', error);
    throw error;
  }
};

export const descargarComprobante = async (id_pedido) => {
  try {
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }
    
    console.log('📥 Preparando descarga de comprobante para pedido:', id_pedido);
    
    // Crear URL con token como parámetro (alternativa para móvil)
    const downloadUrl = `${BASE_URL}/comprobantes/generar/${id_pedido}?token=${encodeURIComponent(token)}`;
    
    console.log('🌐 Abriendo URL de descarga:', downloadUrl);
    
    // Abrir en el navegador para descargar
    const canOpen = await Linking.canOpenURL(downloadUrl);
    
    if (canOpen) {
      await Linking.openURL(downloadUrl);
      
      return {
        success: true,
        message: 'Comprobante abierto en el navegador para descarga',
        url: downloadUrl
      };
    } else {
      throw new Error('No se puede abrir el enlace de descarga');
    }
    
  } catch (error) {
    console.error('❌ Error en descargarComprobante:', error);
    throw error;
  }
};

export const compartirComprobante = async (id_pedido) => {
  try {
    console.log('📤 Preparando compartir comprobante para pedido:', id_pedido);
    
    // Obtener token de autenticación
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }
    
    // Crear URL para compartir
    const shareUrl = `${BASE_URL}/comprobantes/generar/${id_pedido}?token=${encodeURIComponent(token)}`;
    
    // Mostrar opciones al usuario
    Alert.alert(
      'Compartir Comprobante',
      'Selecciona cómo deseas compartir el comprobante:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Copiar Enlace',
          onPress: async () => {
            try {
              // Intentar copiar al portapapeles (si está disponible)
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                Alert.alert('Éxito', 'Enlace copiado al portapapeles');
              } else {
                // Fallback: mostrar el enlace para copiarlo manualmente
                Alert.alert(
                  'Enlace del Comprobante',
                  shareUrl,
                  [
                    { text: 'Cerrar', style: 'cancel' },
                    { 
                      text: 'Abrir', 
                      onPress: () => Linking.openURL(shareUrl)
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error copiando enlace:', error);
              Alert.alert('Error', 'No se pudo copiar el enlace');
            }
          }
        },
        {
          text: 'Abrir',
          onPress: () => Linking.openURL(shareUrl)
        }
      ]
    );
    
    return {
      success: true,
      message: 'Opciones de compartir mostradas',
      url: shareUrl
    };
    
  } catch (error) {
    console.error('❌ Error en compartirComprobante:', error);
    return {
      success: false,
      message: error.message || 'Error al preparar el comprobante para compartir'
    };
  }
};
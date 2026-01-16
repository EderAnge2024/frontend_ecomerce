import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPedidosByAdmin, getProductosByPedido, updatePedidoEstado } from '../../../../components/services/store/pedidos';
import { useAuth } from '../../../../components/context/authContext';

const AdminPedidos = () => {
  // Usuario actual del contexto
  const { user } = useAuth();
  
  // Lista de pedidos con productos del admin
  const [pedidos, setPedidos] = useState([]);
  
  // Estado de carga inicial
  const [loading, setLoading] = useState(true);
  
  // Estado de recarga (pull to refresh)
  const [refreshing, setRefreshing] = useState(false);
  
  // ID del pedido expandido para ver detalles
  const [expandedPedido, setExpandedPedido] = useState(null);
  
  // Productos de cada pedido { id_pedido: [productos] }
  const [productosPedido, setProductosPedido] = useState({});
  
  // Información detallada de productos { id_producto: info }
  const [productosInfo, setProductosInfo] = useState({});

  // Estados adicionales para el modal de comprobante
  const [modalComprobante, setModalComprobante] = useState(false);
  const [comprobanteData, setComprobanteData] = useState(null);
  const [loadingComprobante, setLoadingComprobante] = useState(false);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  // Obtener pedidos que contienen productos del admin
  const cargarPedidos = async () => {
    try {
      setLoading(true);
      // Solo pedidos con al menos un producto del admin
      const response = await getPedidosByAdmin(user.id_usuario);
      if (response.success) {
        setPedidos(response.pedidos);
        console.log(`✅ Pedidos con productos del admin ${user.id_usuario}:`, response.pedidos.length);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los pedidos');
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      Alert.alert('Error', 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Recargar pedidos (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPedidos();
    setRefreshing(false);
  };

  // Cargar productos de un pedido específico
  const cargarProductosPedido = async (id_pedido) => {
    try {
      // Evitar cargar si ya están en memoria
      if (productosPedido[id_pedido]) {
        return;
      }

      const response = await getProductosByPedido(id_pedido);
      if (response.success) {
        setProductosPedido((prev) => ({
          ...prev,
          [id_pedido]: response.productos,
        }));

        // Cargar información de productos desde FakeStore API
        for (const producto of response.productos) {
          if (!productosInfo[producto.id_producto]) {
            cargarInfoProducto(producto.id_producto);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando productos del pedido:', error);
    }
  };

  // Cargar información detallada de un producto
  const cargarInfoProducto = async (id_producto) => {
    try {
      const { getProductoById } = await import('../../../../components/services/store/productos');
      // Convertir id_producto a integer (viene como string desde pedido_producto)
      const id_producto_int = parseInt(id_producto, 10);
      const response = await getProductoById(id_producto_int);
      if (response.success && response.producto) {
        setProductosInfo((prev) => ({
          ...prev,
          [id_producto]: response.producto, // Usar el string original como key
        }));
      }
    } catch (error) {
      console.error('Error cargando info del producto:', error);
    }
  };

  const cambiarEstadoPedido = async (id_pedido, nuevoEstado) => {
    try {
      const response = await updatePedidoEstado(id_pedido, nuevoEstado);
      if (response.success) {
        // Actualizar el estado local
        setPedidos((prev) =>
          prev.map((pedido) =>
            pedido.id_pedido === id_pedido
              ? { ...pedido, estado: nuevoEstado }
              : pedido
          )
        );
        Alert.alert('Éxito', 'Estado del pedido actualizado');
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      Alert.alert('Error', 'Error al actualizar el estado del pedido');
    }
  };

  // Función principal para generar imagen del comprobante
  const generarImagenComprobante = async (datosComprobante) => {
    try {
      console.log('🖼️ Generando imagen del comprobante...');
      
      // Para React Native Web, podemos usar la función de canvas
      if (typeof document !== 'undefined') {
        return await generarImagenCanvas(datosComprobante);
      }
      
      // Para React Native móvil, mostrar mensaje alternativo
      Alert.alert(
        'Comprobante Generado',
        `El comprobante del pedido #${datosComprobante.pedido.id_pedido} está listo.\n\nEn dispositivos móviles, puedes tomar una captura de pantalla del modal de previsualización.`,
        [
          {
            text: 'Ver Previsualización',
            onPress: () => {
              setComprobanteData(datosComprobante);
              setModalComprobante(true);
            }
          },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Error generando imagen:', error);
      Alert.alert('Error', 'No se pudo generar la imagen del comprobante');
    }
  };

  // Función auxiliar para generar imagen con canvas
  const generarImagenCanvas = async (datosComprobante) => {
    try {
      // Crear un canvas virtual
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar el canvas
      canvas.width = 800;
      canvas.height = 1000;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configurar fuentes y colores
      ctx.fillStyle = '#221329';
      ctx.textAlign = 'center';
      
      let y = 50;
      
      // Header
      ctx.font = 'bold 32px Arial';
      ctx.fillText('ECOMMERCE STORE', canvas.width / 2, y);
      y += 40;
      
      ctx.font = '20px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('COMPROBANTE DE VENTA', canvas.width / 2, y);
      y += 30;
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#221329';
      ctx.fillText(`#${datosComprobante.pedido.id_pedido}`, canvas.width / 2, y);
      y += 60;
      
      // Línea separadora
      ctx.strokeStyle = '#221329';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.stroke();
      y += 40;
      
      // Información del cliente
      ctx.textAlign = 'left';
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#221329';
      ctx.fillText('DATOS DEL CLIENTE', 50, y);
      y += 30;
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(`${datosComprobante.cliente.nombre} ${datosComprobante.cliente.apellido}`, 50, y);
      y += 25;
      
      if (datosComprobante.cliente.correo) {
        ctx.fillText(datosComprobante.cliente.correo, 50, y);
        y += 25;
      }
      
      if (datosComprobante.cliente.telefono) {
        ctx.fillText(datosComprobante.cliente.telefono, 50, y);
        y += 25;
      }
      
      y += 20;
      
      // Información de la venta
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#221329';
      ctx.fillText('INFORMACIÓN DE VENTA', 50, y);
      y += 30;
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      const fecha = new Date(datosComprobante.pedido.fecha_pedido).toLocaleDateString();
      ctx.fillText(`Fecha: ${fecha}`, 50, y);
      y += 25;
      ctx.fillText(`Estado: ${datosComprobante.pedido.estado}`, 50, y);
      y += 40;
      
      // Productos
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#221329';
      ctx.fillText('PRODUCTOS', 50, y);
      y += 30;
      
      // Headers de tabla
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Producto', 50, y);
      ctx.fillText('Cant.', 400, y);
      ctx.fillText('Precio', 500, y);
      ctx.fillText('Subtotal', 650, y);
      y += 25;
      
      // Línea bajo headers
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.stroke();
      y += 20;
      
      // Productos
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      
      datosComprobante.productos.forEach((producto) => {
        const nombreCorto = producto.title.length > 30 ? 
          producto.title.substring(0, 30) + '...' : 
          producto.title;
        
        ctx.fillText(nombreCorto, 50, y);
        ctx.fillText(producto.cantidad.toString(), 400, y);
        ctx.fillText(`S/ ${producto.precio.toFixed(2)}`, 500, y);
        ctx.fillText(`S/ ${(producto.cantidad * producto.precio).toFixed(2)}`, 650, y);
        y += 25;
      });
      
      y += 20;
      
      // Línea antes del total
      ctx.strokeStyle = '#221329';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.stroke();
      y += 30;
      
      // Total
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#221329';
      ctx.textAlign = 'center';
      ctx.fillText(`TOTAL: S/ ${datosComprobante.pedido.total.toFixed(2)}`, canvas.width / 2, y);
      
      // Convertir canvas a blob
      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });
      
    } catch (error) {
      console.error('Error generando imagen canvas:', error);
      throw error;
    }
  };

  // Función para descargar imagen del comprobante (versión mejorada)
  const descargarImagenComprobante = async (datosComprobante) => {
    try {
      // Verificar si estamos en web o móvil
      if (typeof document !== 'undefined') {
        // Versión web - usar canvas
        console.log('🖼️ Generando imagen del comprobante para web...');
        
        const blob = await generarImagenComprobante(datosComprobante);
        
        // Crear URL para descarga
        const url = URL.createObjectURL(blob);
        
        // Crear elemento de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-${datosComprobante.pedido.id_pedido}.png`;
        
        // Simular click para descargar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL
        URL.revokeObjectURL(url);
        
        Alert.alert(
          'Comprobante Descargado',
          `El comprobante del pedido #${datosComprobante.pedido.id_pedido} se ha descargado como imagen.`,
          [{ text: 'OK' }]
        );
      } else {
        // Versión móvil - mostrar modal para captura de pantalla
        Alert.alert(
          'Comprobante Listo',
          'En dispositivos móviles, puedes tomar una captura de pantalla del comprobante.\n\n¿Deseas ver la previsualización?',
          [
            {
              text: 'Ver Comprobante',
              onPress: () => {
                setComprobanteData(datosComprobante);
                setModalComprobante(true);
              }
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error descargando imagen:', error);
      Alert.alert('Error', 'No se pudo procesar el comprobante');
    }
  };

  // Función alternativa para generar comprobante con datos locales
  const generarComprobanteLocal = (pedido) => {
    const datosComprobante = {
      pedido: {
        id_pedido: pedido.id_pedido,
        fecha_pedido: pedido.fecha_pedido,
        estado: pedido.estado,
        total: parseFloat(pedido.total)
      },
      cliente: {
        nombre: pedido.nombre,
        apellido: pedido.apellido,
        correo: pedido.correo,
        telefono: pedido.usuario_telefono,
        direccion: pedido.ubicacion_direccion
      },
      productos: productosPedido[pedido.id_pedido]?.map(p => {
        const info = productosInfo[p.id_producto];
        return {
          id_producto: p.id_producto,
          title: info?.title || `Producto #${p.id_producto}`,
          cantidad: p.cantidad,
          precio: parseFloat(p.precio)
        };
      }) || []
    };
    
    setComprobanteData(datosComprobante);
    setModalComprobante(true);
  };

  // Obtener datos del comprobante para previsualización
  const obtenerDatosComprobante = async (id_pedido) => {
    try {
      setLoadingComprobante(true);
      const token = await AsyncStorage.getItem('token');
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
      
      console.log('🔍 Obteniendo datos del comprobante para pedido:', id_pedido);
      console.log('🌐 URL completa:', `${API_BASE_URL}/comprobantes/preview/${id_pedido}`);
      console.log('🔑 Token disponible:', !!token);
      
      const response = await fetch(`${API_BASE_URL}/comprobantes/preview/${id_pedido}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Status de respuesta preview:', response.status);
      console.log('📡 Response OK:', response.ok);
      
      const data = await response.json();
      console.log('📦 Datos de respuesta preview completos:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success && data.data) {
        console.log('✅ Datos recibidos correctamente');
        console.log('🔍 Estructura de datos:', {
          pedido: !!data.data.pedido,
          cliente: !!data.data.cliente,
          productos: !!data.data.productos,
          productosLength: data.data.productos?.length
        });
        
        // Validar estructura de datos
        if (!data.data.pedido || !data.data.cliente || !data.data.productos) {
          console.error('❌ Estructura de datos incompleta:', data.data);
          Alert.alert('Error', 'Los datos del comprobante están incompletos');
          return;
        }
        
        setComprobanteData(data.data);
        setModalComprobante(true);
      } else {
        console.error('❌ Error en respuesta:', data);
        Alert.alert('Error', data.message || 'No se pudieron obtener los datos del comprobante');
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos del comprobante:', error);
      Alert.alert('Error', `Error al obtener los datos del comprobante: ${error.message}`);
    } finally {
      setLoadingComprobante(false);
    }
  };





  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return '#FFA500';
      case 'En proceso':
        return '#2196F3';
      case 'Entregado':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const toggleExpandPedido = async (id_pedido) => {
    if (expandedPedido === id_pedido) {
      setExpandedPedido(null);
    } else {
      setExpandedPedido(id_pedido);
      await cargarProductosPedido(id_pedido);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Renderizar cada producto del pedido
  const renderProducto = ({ item }) => {
    const info = productosInfo[item.id_producto];
    const isLoading = !info;
    
    return (
      <View style={styles.productoItem}>
        {/* Imagen del producto o placeholder */}
        <View style={styles.productoImageContainer}>
          {isLoading ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="small" color="#221329" />
            </View>
          ) : info?.image ? (
            <img 
              src={info.image} 
              alt={info.title}
              style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8 }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={30} color="#ccc" />
            </View>
          )}
        </View>
        
        {/* Información del producto */}
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>
            {info?.title || `Producto #${item.id_producto}`}
          </Text>
          <Text style={styles.productoDetalle}>
            Cantidad: {item.cantidad}
          </Text>
          <Text style={styles.productoDetalle}>
            Precio: S/ {parseFloat(item.precio).toFixed(2)}
          </Text>
          <Text style={styles.productoTotal}>
            Subtotal: S/ {(item.cantidad * parseFloat(item.precio)).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPedido = ({ item }) => {
    const isExpanded = expandedPedido === item.id_pedido;
    const productos = productosPedido[item.id_pedido] || [];
    const estadoActual = item.estado || 'Pendiente';

    return (
      <View style={styles.pedidoCard}>
        <TouchableOpacity
          style={styles.pedidoHeader}
          onPress={() => toggleExpandPedido(item.id_pedido)}
        >
          <View style={styles.pedidoHeaderLeft}>
            <Text style={styles.pedidoId}>Pedido #{item.id_pedido}</Text>
            <Text style={styles.pedidoCliente}>
              Cliente: {item.nombre} {item.apellido}
            </Text>
            <Text style={styles.pedidoFecha}>
              {formatearFecha(item.fecha_pedido)}
            </Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(estadoActual) }]}>
              <Text style={styles.estadoText}>{estadoActual}</Text>
            </View>
          </View>
          <View style={styles.pedidoHeaderRight}>
            <Text style={styles.pedidoTotal}>
              S/ {parseFloat(item.total).toFixed(2)}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#221329"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.pedidoDetalle}>
            {/* Información del Cliente */}
            <View style={styles.clienteInfo}>
              <View style={styles.infoHeader}>
                <Ionicons name="person" size={20} color="#221329" />
                <Text style={styles.clienteInfoLabel}>Información del Cliente</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.clienteInfoText}>
                  {item.nombre} {item.apellido}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#666" />
                <Text style={styles.clienteInfoText}>{item.correo}</Text>
              </View>
              {item.usuario_telefono && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.clienteInfoText}>{item.usuario_telefono}</Text>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => {
                      const telefono = item.usuario_telefono.replace(/\D/g, ''); // Remover caracteres no numéricos
                      const mensaje = `Hola ${item.nombre} ${item.apellido}, te contactamos desde ECommerce Store sobre tu pedido #${item.id_pedido}.`;
                      const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
                      
                      Linking.canOpenURL(whatsappUrl)
                        .then((supported) => {
                          if (supported) {
                            return Linking.openURL(whatsappUrl);
                          } else {
                            Alert.alert(
                              'WhatsApp no disponible',
                              'WhatsApp no está instalado en este dispositivo',
                              [{ text: 'OK' }]
                            );
                          }
                        })
                        .catch((error) => {
                          console.error('Error abriendo WhatsApp:', error);
                          Alert.alert('Error', 'No se pudo abrir WhatsApp');
                        });
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Dirección de Envío */}
            <View style={styles.ubicacionInfo}>
              <View style={styles.infoHeader}>
                <Ionicons name="location" size={20} color="#221329" />
                <Text style={styles.clienteInfoLabel}>Dirección de Envío</Text>
              </View>
              
              {(item.ubicacion_direccion || item.ubicacion_nombre) ? (
                <>
                  {item.ubicacion_nombre && (
                    <View style={styles.infoRow}>
                      <Ionicons name="home-outline" size={16} color="#666" />
                      <Text style={styles.clienteInfoText}>{item.ubicacion_nombre}</Text>
                    </View>
                  )}
                  {item.ubicacion_direccion && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.clienteInfoText}>{item.ubicacion_direccion}</Text>
                    </View>
                  )}
                  {item.ubicacion_ciudad && (
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={16} color="#666" />
                      <Text style={styles.clienteInfoText}>
                        {item.ubicacion_ciudad}
                        {item.ubicacion_codigo_postal ? ` - ${item.ubicacion_codigo_postal}` : ''}
                      </Text>
                    </View>
                  )}
                  {item.ubicacion_telefono && (
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={16} color="#666" />
                      <Text style={styles.clienteInfoText}>{item.ubicacion_telefono}</Text>
                      <TouchableOpacity
                        style={styles.whatsappButton}
                        onPress={() => {
                          const telefono = item.ubicacion_telefono.replace(/\D/g, ''); // Remover caracteres no numéricos
                          const mensaje = `Hola, te contactamos desde ECommerce Store sobre la entrega del pedido #${item.id_pedido} en ${item.ubicacion_direccion || 'tu dirección'}.`;
                          const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
                          
                          Linking.canOpenURL(whatsappUrl)
                            .then((supported) => {
                              if (supported) {
                                return Linking.openURL(whatsappUrl);
                              } else {
                                Alert.alert(
                                  'WhatsApp no disponible',
                                  'WhatsApp no está instalado en este dispositivo',
                                  [{ text: 'OK' }]
                                );
                              }
                            })
                            .catch((error) => {
                              console.error('Error abriendo WhatsApp:', error);
                              Alert.alert('Error', 'No se pudo abrir WhatsApp');
                            });
                        }}
                      >
                        <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noUbicacionContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
                  <Text style={styles.noUbicacionText}>
                    No se especificó dirección de envío para este pedido
                  </Text>
                </View>
              )}
            </View>

            {/* Selector de Estado */}
            <View style={styles.estadoContainer}>
              <Text style={styles.estadoLabel}>Cambiar Estado:</Text>
              <View style={styles.estadoBotones}>
                {['Pendiente', 'En proceso', 'Entregado'].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.estadoBoton,
                      estadoActual === estado && styles.estadoBotonActivo,
                      { borderColor: getEstadoColor(estado) }
                    ]}
                    onPress={() => cambiarEstadoPedido(item.id_pedido, estado)}
                  >
                    <Text
                      style={[
                        styles.estadoBotonText,
                        estadoActual === estado && { color: '#fff' }
                      ]}
                    >
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botones de Comprobante */}
            <View style={styles.comprobanteContainer}>
              <Text style={styles.comprobanteLabel}>Comprobante de Venta:</Text>
              <View style={styles.comprobanteBotones}>
                <TouchableOpacity
                  style={[styles.comprobanteBoton, styles.comprobanteBotonPreview]}
                  onPress={() => {
                    // Intentar generar comprobante con datos locales primero
                    if (productosPedido[item.id_pedido] && productosPedido[item.id_pedido].length > 0) {
                      console.log('📋 Generando comprobante con datos locales');
                      generarComprobanteLocal(item);
                    } else {
                      console.log('🌐 Obteniendo datos del servidor');
                      obtenerDatosComprobante(item.id_pedido);
                    }
                  }}
                  disabled={loadingComprobante}
                >
                  {loadingComprobante ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="eye-outline" size={20} color="#fff" />
                  )}
                  <Text style={styles.comprobanteBotonText}>Previsualizar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.comprobanteBoton}
                  onPress={() => {
                    console.log('🔘 Botón Descargar Imagen presionado');
                    // Usar datos locales si están disponibles
                    if (productosPedido[item.id_pedido] && productosPedido[item.id_pedido].length > 0) {
                      const datosLocales = {
                        pedido: {
                          id_pedido: item.id_pedido,
                          fecha_pedido: item.fecha_pedido,
                          estado: item.estado,
                          total: parseFloat(item.total)
                        },
                        cliente: {
                          nombre: item.nombre,
                          apellido: item.apellido,
                          correo: item.correo,
                          telefono: item.usuario_telefono
                        },
                        productos: productosPedido[item.id_pedido].map(p => {
                          const info = productosInfo[p.id_producto];
                          return {
                            id_producto: p.id_producto,
                            title: info?.title || `Producto #${p.id_producto}`,
                            cantidad: p.cantidad,
                            precio: parseFloat(p.precio)
                          };
                        })
                      };
                      descargarImagenComprobante(datosLocales);
                    } else {
                      // Obtener datos del servidor si no están disponibles localmente
                      obtenerDatosComprobante(item.id_pedido).then(() => {
                        // Después de obtener los datos, intentar descargar
                        setTimeout(() => {
                          if (comprobanteData) {
                            descargarImagenComprobante(comprobanteData);
                          }
                        }, 1000);
                      });
                    }
                  }}
                >
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.comprobanteBotonText}>Descargar Imagen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.comprobanteBoton, styles.comprobanteBotonCompartir]}
                  onPress={async () => {
                    try {
                      // Obtener token
                      const token = await AsyncStorage.getItem('token');
                      
                      if (!token) {
                        Alert.alert('Error', 'No se encontró token de autenticación');
                        return;
                      }
                      
                      // Usar la variable de entorno y la nueva ruta con token
                      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
                      const comprobanteUrl = `${API_BASE_URL}/comprobantes/generar-url/${item.id_pedido}?token=${token}`;
                      
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
                            onPress: () => {
                              Alert.alert(
                                'Enlace del Comprobante',
                                `Enlace: ${comprobanteUrl}\n\nNota: Este enlace incluye autenticación temporal.`,
                                [
                                  { text: 'Cerrar', style: 'cancel' },
                                  { 
                                    text: 'Abrir', 
                                    onPress: () => Linking.openURL(comprobanteUrl)
                                  }
                                ]
                              );
                            }
                          },
                          {
                            text: 'Abrir Ahora',
                            onPress: () => {
                              Linking.openURL(comprobanteUrl);
                              Alert.alert(
                                'Comprobante Abierto',
                                'El comprobante se ha abierto en tu navegador. Desde ahí puedes imprimirlo o guardarlo como PDF.',
                                [{ text: 'Entendido' }]
                              );
                            }
                          }
                        ]
                      );
                      
                    } catch (error) {
                      console.error('❌ Error compartiendo comprobante:', error);
                      Alert.alert('Error', `Error: ${error.message}`);
                    }
                  }}
                >
                  <Ionicons name="share-outline" size={20} color="#fff" />
                  <Text style={styles.comprobanteBotonText}>Compartir</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.productosLabel}>Productos:</Text>
            {productos.length > 0 ? (
              <FlatList
                data={productos}
                renderItem={renderProducto}
                keyExtractor={(producto) => producto.id_propedido?.toString()}
                scrollEnabled={false}
              />
            ) : (
              <ActivityIndicator size="small" color="#221329" />
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#221329" />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={32} color="#221329" />
        <Text style={styles.headerTitle}>Gestión de Pedidos</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pedidos.length}</Text>
          <Text style={styles.statLabel}>Total Pedidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            S/{' '}
            {pedidos
              .reduce((sum, p) => sum + parseFloat(p.total), 0)
              .toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total Ventas</Text>
        </View>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay pedidos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id_pedido.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal de previsualización del comprobante */}
      <Modal
        visible={modalComprobante}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalComprobante(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Comprobante de Venta</Text>
              <TouchableOpacity onPress={() => setModalComprobante(false)}>
                <Ionicons name="close" size={24} color="#221329" />
              </TouchableOpacity>
            </View>
            
            {comprobanteData && comprobanteData.pedido && comprobanteData.cliente ? (
              <ScrollView style={styles.modalContent}>
                <View style={styles.comprobantePreview}>
                  {/* Header del comprobante */}
                  <View style={styles.comprobantePreviewHeader}>
                    <Text style={styles.comprobanteEmpresa}>ECOMMERCE STORE</Text>
                    <Text style={styles.comprobanteTipo}>COMPROBANTE DE VENTA</Text>
                    <Text style={styles.comprobanteNumero}>#{comprobanteData.pedido.id_pedido}</Text>
                  </View>
                  
                  {/* Información del cliente */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>DATOS DEL CLIENTE</Text>
                    <Text style={styles.comprobanteTexto}>
                      {comprobanteData.cliente.nombre || ''} {comprobanteData.cliente.apellido || ''}
                    </Text>
                    {comprobanteData.cliente.correo && (
                      <Text style={styles.comprobanteTexto}>{comprobanteData.cliente.correo}</Text>
                    )}
                    {comprobanteData.cliente.telefono && (
                      <Text style={styles.comprobanteTexto}>{comprobanteData.cliente.telefono}</Text>
                    )}
                  </View>
                  
                  {/* Información de la venta */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>INFORMACIÓN DE VENTA</Text>
                    <Text style={styles.comprobanteTexto}>
                      Fecha: {comprobanteData.pedido.fecha_pedido ? 
                        new Date(comprobanteData.pedido.fecha_pedido).toLocaleDateString() : 
                        'No disponible'
                      }
                    </Text>
                    <Text style={styles.comprobanteTexto}>
                      Estado: {comprobanteData.pedido.estado || 'No disponible'}
                    </Text>
                  </View>
                  
                  {/* Productos */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>PRODUCTOS</Text>
                    {comprobanteData.productos && comprobanteData.productos.length > 0 ? (
                      comprobanteData.productos.map((producto, index) => (
                        <View key={index} style={styles.comprobanteProducto}>
                          <Text style={styles.comprobanteProductoNombre}>
                            {producto.title || `Producto #${producto.id_producto || index + 1}`}
                          </Text>
                          <View style={styles.comprobanteProductoDetalle}>
                            <Text style={styles.comprobanteTexto}>
                              {producto.cantidad || 0} x S/ {parseFloat(producto.precio || 0).toFixed(2)}
                            </Text>
                            <Text style={styles.comprobanteProductoTotal}>
                              S/ {((producto.cantidad || 0) * parseFloat(producto.precio || 0)).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.comprobanteTexto}>No hay productos disponibles</Text>
                    )}
                  </View>
                  
                  {/* Total */}
                  <View style={styles.comprobanteTotal}>
                    <Text style={styles.comprobanteTotalTexto}>
                      TOTAL: S/ {parseFloat(comprobanteData.pedido.total || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.modalContent}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#221329" />
                  <Text style={styles.loadingText}>Cargando comprobante...</Text>
                </View>
              </View>
            )}
            
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={styles.modalCancelarBtn}
                onPress={() => setModalComprobante(false)}
              >
                <Text style={styles.modalCancelarText}>Cerrar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmarBtn}
                onPress={() => {
                  if (comprobanteData && comprobanteData.pedido && comprobanteData.pedido.id_pedido) {
                    descargarImagenComprobante(comprobanteData);
                  } else {
                    Alert.alert('Error', 'No se puede descargar el comprobante');
                  }
                  setModalComprobante(false);
                }}
              >
                <Text style={styles.modalConfirmarText}>Descargar Imagen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  pedidoHeaderLeft: {
    flex: 1,
  },
  pedidoHeaderRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  pedidoCliente: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  pedidoFecha: {
    fontSize: 12,
    color: '#999',
  },
  pedidoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 8,
  },
  pedidoDetalle: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  clienteInfo: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  ubicacionInfo: {
    backgroundColor: '#f0fff4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  clienteInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  clienteInfoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  whatsappButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productosLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  productoItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  productoImageContainer: {
    width: 60,
    height: 60,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  productoDetalle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  productoTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  estadoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  estadoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  estadoBotones: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  estadoBoton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  estadoBotonActivo: {
    backgroundColor: '#221329',
  },
  estadoBotonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#221329',
  },
  noUbicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  noUbicacionText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontStyle: 'italic',
  },
  // Estilos para comprobantes
  comprobanteContainer: {
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  comprobanteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  comprobanteBotones: {
    flexDirection: 'row',
    gap: 12,
  },
  comprobanteBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comprobanteBotonCompartir: {
    backgroundColor: '#4CAF50',
  },
  comprobanteBotonPreview: {
    backgroundColor: '#FF9800',
  },
  comprobanteBotonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Estilos para el modal de comprobante
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
  },
  modalContent: {
    padding: 20,
  },
  comprobantePreview: {
    backgroundColor: '#fff',
  },
  comprobantePreviewHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#221329',
  },
  comprobanteEmpresa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 5,
  },
  comprobanteTipo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  comprobanteNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
  },
  comprobanteSeccion: {
    marginBottom: 20,
  },
  comprobanteSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  comprobanteTexto: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  comprobanteProducto: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  comprobanteProductoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  comprobanteProductoDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comprobanteProductoTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#221329',
  },
  comprobanteTotal: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#221329',
    alignItems: 'center',
  },
  comprobanteTotalTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
  },
  modalAcciones: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalCancelarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#221329',
    alignItems: 'center',
  },
  modalCancelarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  modalConfirmarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#221329',
    alignItems: 'center',
  },
  modalConfirmarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminPedidos;

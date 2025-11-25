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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const renderProducto = ({ item }) => {
    const info = productosInfo[item.id_producto];
    
    return (
      <View style={styles.productoItem}>
        {info?.image && (
          <img 
            src={info.image} 
            alt={info.title}
            style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8 }}
          />
        )}
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>
            {info?.title || `Producto #${item.id_producto}`}
          </Text>
          <Text style={styles.productoDetalle}>Cantidad: {item.cantidad}</Text>
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
});

export default AdminPedidos;

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
import { getAllPedidos, getProductosByPedido } from '../../../../components/services/store/pedidos';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPedido, setExpandedPedido] = useState(null);
  const [productosPedido, setProductosPedido] = useState({});

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await getAllPedidos();
      if (response.success) {
        setPedidos(response.pedidos);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPedidos();
    setRefreshing(false);
  };

  const cargarProductosPedido = async (id_pedido) => {
    try {
      if (productosPedido[id_pedido]) {
        // Ya están cargados
        return;
      }

      const response = await getProductosByPedido(id_pedido);
      if (response.success) {
        setProductosPedido((prev) => ({
          ...prev,
          [id_pedido]: response.productos,
        }));
      }
    } catch (error) {
      console.error('Error cargando productos del pedido:', error);
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

  const renderProducto = ({ item }) => (
    <View style={styles.productoItem}>
      <Text style={styles.productoNombre}>ID Producto: {item.id_producto}</Text>
      <Text style={styles.productoDetalle}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.productoDetalle}>
        Precio: S/ {parseFloat(item.precio).toFixed(2)}
      </Text>
      <Text style={styles.productoTotal}>
        Subtotal: S/ {(item.cantidad * parseFloat(item.precio)).toFixed(2)}
      </Text>
    </View>
  );

  const renderPedido = ({ item }) => {
    const isExpanded = expandedPedido === item.id_pedido;
    const productos = productosPedido[item.id_pedido] || [];

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
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteInfoLabel}>Información del Cliente:</Text>
              <Text style={styles.clienteInfoText}>Correo: {item.correo}</Text>
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
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  clienteInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 8,
  },
  clienteInfoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  productosLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  productoItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
});

export default AdminPedidos;

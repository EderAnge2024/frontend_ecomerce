import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';

export default function MyCompra() {
  // Datos de ejemplo - en producción vendrían de una API o contexto
  const [compras] = useState([
    {
      id: 1,
      fecha: '2025-11-10',
      total: 150.50,
      estado: 'Entregado',
      productos: [
        { id: 1, nombre: 'Producto A', cantidad: 2, precio: 50.25 },
        { id: 2, nombre: 'Producto B', cantidad: 1, precio: 50.00 },
      ],
    },
    {
      id: 2,
      fecha: '2025-11-08',
      total: 89.99,
      estado: 'En camino',
      productos: [
        { id: 3, nombre: 'Producto C', cantidad: 1, precio: 89.99 },
      ],
    },
    {
      id: 3,
      fecha: '2025-11-05',
      total: 245.00,
      estado: 'Procesando',
      productos: [
        { id: 4, nombre: 'Producto D', cantidad: 3, precio: 75.00 },
        { id: 5, nombre: 'Producto E', cantidad: 1, precio: 20.00 },
      ],
    },
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado':
        return '#4CAF50';
      case 'En camino':
        return '#2196F3';
      case 'Procesando':
        return '#FF9800';
      case 'Cancelado':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderCompra = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.compraCard}>
        <TouchableOpacity 
          style={styles.compraHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.compraInfo}>
            <View style={styles.compraRow}>
              <Text style={styles.compraId}>Pedido #{item.id}</Text>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                <Text style={styles.estadoText}>{item.estado}</Text>
              </View>
            </View>
            
            <Text style={styles.compraFecha}>📅 {item.fecha}</Text>
            <Text style={styles.compraTotal}>Total: S/ {item.total.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.productosContainer}>
            <Text style={styles.productosTitle}>Productos:</Text>
            {item.productos.map((producto) => (
              <View key={producto.id} style={styles.productoItem}>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{producto.nombre}</Text>
                  <Text style={styles.productoCantidad}>Cantidad: {producto.cantidad}</Text>
                </View>
                <Text style={styles.productoPrecio}>S/ {producto.precio.toFixed(2)}</Text>
              </View>
            ))}
            
            <View style={styles.accionesContainer}>
              <TouchableOpacity style={styles.botonAccion}>
                <Text style={styles.botonAccionText}>Ver Detalles</Text>
              </TouchableOpacity>
              
              {item.estado === 'Entregado' && (
                <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]}>
                  <Text style={styles.botonAccionText}>Volver a Comprar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Compras</Text>
        <Text style={styles.headerSubtitle}>Historial de pedidos</Text>
      </View>

      {compras.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyText}>No tienes compras aún</Text>
          <Text style={styles.emptySubtext}>Explora nuestros productos y realiza tu primera compra</Text>
        </View>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCompra}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  compraCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  compraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  compraInfo: {
    flex: 1,
  },
  compraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compraId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  compraFecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  compraTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#071e85',
  },
  expandIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 10,
  },
  productosContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 15,
    backgroundColor: '#fafafa',
  },
  productosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  productoCantidad: {
    fontSize: 12,
    color: '#999',
  },
  productoPrecio: {
    fontSize: 14,
    fontWeight: '600',
    color: '#071e85',
  },
  accionesContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: '#071e85',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonSecundario: {
    backgroundColor: '#4CAF50',
  },
  botonAccionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

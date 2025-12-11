import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from './context/carritoContext';

const PreviewDivisionVendedores = ({ visible = true }) => {
  const { previewDivision, carrito } = useCart();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && carrito.length > 0) {
      obtenerPreview();
    }
  }, [visible, carrito]);

  const obtenerPreview = async () => {
    setLoading(true);
    try {
      const resultado = await previewDivision();
      if (resultado.success) {
        setPreview(resultado.preview);
      }
    } catch (error) {
      console.error('Error obteniendo preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || carrito.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#221329" />
          <Text style={styles.loadingText}>Analizando vendedores...</Text>
        </View>
      </View>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={20} color="#221329" />
        <Text style={styles.headerTitle}>División por Vendedores</Text>
      </View>

      {preview.es_pedido_compartido ? (
        <View style={styles.alertContainer}>
          <Ionicons name="information-circle" size={16} color="#2196F3" />
          <Text style={styles.alertText}>
            Tu pedido se dividirá entre {preview.total_vendedores} vendedores
          </Text>
        </View>
      ) : (
        <View style={styles.alertContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.alertText}>
            Todos los productos son del mismo vendedor
          </Text>
        </View>
      )}

      <ScrollView style={styles.vendedoresContainer} showsVerticalScrollIndicator={false}>
        {preview.division_por_vendedor.map((division, index) => (
          <View key={division.vendedor_id} style={styles.vendedorCard}>
            <View style={styles.vendedorHeader}>
              <View style={styles.vendedorInfo}>
                <Text style={styles.vendedorNombre}>
                  {division.vendedor_nombre}
                </Text>
                <Text style={styles.vendedorCorreo}>
                  {division.vendedor_correo}
                </Text>
              </View>
              <Text style={styles.vendedorTotal}>
                S/ {division.total_vendedor.toFixed(2)}
              </Text>
            </View>

            <View style={styles.productosContainer}>
              {division.productos.map((producto, prodIndex) => (
                <View key={`${producto.id}-${prodIndex}`} style={styles.productoItem}>
                  <Text style={styles.productoNombre} numberOfLines={1}>
                    {producto.nombre}
                  </Text>
                  <View style={styles.productoDetalle}>
                    <Text style={styles.productoCantidad}>
                      {producto.cantidad}x
                    </Text>
                    <Text style={styles.productoSubtotal}>
                      S/ {producto.subtotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total General:</Text>
        <Text style={styles.totalAmount}>
          S/ {preview.total_general.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  alertText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  vendedoresContainer: {
    maxHeight: 200,
  },
  vendedorCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vendedorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vendedorInfo: {
    flex: 1,
  },
  vendedorNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 2,
  },
  vendedorCorreo: {
    fontSize: 11,
    color: '#666',
  },
  vendedorTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  productosContainer: {
    gap: 4,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  productoNombre: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  productoDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productoCantidad: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productoSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    minWidth: 50,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#221329',
  },
});

export default PreviewDivisionVendedores;
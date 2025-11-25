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
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../components/context/authContext';
import {
  getAllProductos,
  getProductosByUser,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../../../../components/services/store/productos';

const AdminProductos = () => {
  // Obtener usuario actual del contexto
  const { user } = useAuth();
  
  // Lista de productos del admin
  const [productos, setProductos] = useState([]);
  
  // Estado de carga inicial
  const [loading, setLoading] = useState(true);
  
  // Estado de recarga (pull to refresh)
  const [refreshing, setRefreshing] = useState(false);
  
  // Controla visibilidad del modal de crear/editar
  const [modalVisible, setModalVisible] = useState(false);
  
  // Indica si está en modo edición (true) o creación (false)
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Producto que se está editando
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Datos del formulario de producto
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
    rating_rate: '',
    rating_count: '',
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Obtener productos del admin desde la API
  const cargarProductos = async () => {
    try {
      setLoading(true);
      // Solo carga productos del admin actual
      const response = await getProductosByUser(user.id_usuario);
      if (response.success) {
        setProductos(response.productos);
        console.log(`✅ Productos del admin ${user.id_usuario}:`, response.productos.length);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los productos');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Recargar productos (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarProductos();
    setRefreshing(false);
  };

  // Abrir modal para crear nuevo producto
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setProductoSeleccionado(null);
    setFormData({
      title: '',
      price: '',
      description: '',
      category: '',
      image: '',
      rating_rate: '',
      rating_count: '',
    });
    setModalVisible(true);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoSeleccionado(producto);
    setFormData({
      title: producto.title,
      price: producto.price.toString(),
      description: producto.description || '',
      category: producto.category || '',
      image: producto.image || '',
      rating_rate: producto.rating_rate?.toString() || '',
      rating_count: producto.rating_count?.toString() || '',
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModoEdicion(false);
    setProductoSeleccionado(null);
  };

  const handleGuardar = async () => {
    if (!formData.title || !formData.price) {
      Alert.alert('Error', 'El título y precio son obligatorios');
      return;
    }

    try {
      const productoData = {
        id_usuario: user.id_usuario,
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        rating_rate: formData.rating_rate ? parseFloat(formData.rating_rate) : null,
        rating_count: formData.rating_count ? parseInt(formData.rating_count) : null,
      };

      let response;
      if (modoEdicion && productoSeleccionado) {
        response = await updateProducto(productoSeleccionado.id_producto, productoData);
      } else {
        response = await createProducto(productoData);
      }

      if (response.success) {
        Alert.alert(
          'Éxito',
          modoEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
        );
        cerrarModal();
        cargarProductos();
      } else {
        Alert.alert('Error', response.message || 'No se pudo guardar el producto');
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      Alert.alert('Error', 'Error al guardar el producto');
    }
  };

  const handleEliminar = (producto) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar "${producto.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteProducto(producto.id_producto);
              if (response.success) {
                Alert.alert('Éxito', 'Producto eliminado correctamente');
                cargarProductos();
              } else {
                Alert.alert('Error', response.message || 'No se pudo eliminar el producto');
              }
            } catch (error) {
              console.error('Error eliminando producto:', error);
              Alert.alert('Error', 'Error al eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProducto = ({ item }) => (
    <View style={styles.productoCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.productoImagen} />
      )}
      <View style={styles.productoInfo}>
        <Text style={styles.productoTitulo} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productoPrecio}>S/ {parseFloat(item.price).toFixed(2)}</Text>
        {item.category && (
          <Text style={styles.productoCategoria}>{item.category}</Text>
        )}
        {item.rating_rate && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFA500" />
            <Text style={styles.ratingText}>
              {item.rating_rate} ({item.rating_count || 0})
            </Text>
          </View>
        )}
      </View>
      <View style={styles.productoAcciones}>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => abrirModalEditar(item)}
        >
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => handleEliminar(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#221329" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cube-outline" size={32} color="#221329" />
          <Text style={styles.headerTitle}>Gestión de Productos</Text>
        </View>
        <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalNuevo}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{productos.length}</Text>
          <Text style={styles.statLabel}>Total Productos</Text>
        </View>
      </View>

      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay productos registrados</Text>
          <TouchableOpacity style={styles.botonAgregarGrande} onPress={abrirModalNuevo}>
            <Text style={styles.botonAgregarGrandeText}>Agregar Primer Producto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id_producto.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal de Crear/Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={cerrarModal}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Nombre del producto"
              />

              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="99.99"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descripción del producto"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="electronics, clothing, etc."
              />

              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />

              <Text style={styles.label}>Rating (0-5)</Text>
              <TextInput
                style={styles.input}
                value={formData.rating_rate}
                onChangeText={(text) => setFormData({ ...formData, rating_rate: text })}
                placeholder="4.5"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Cantidad de Reviews</Text>
              <TextInput
                style={styles.input}
                value={formData.rating_count}
                onChangeText={(text) => setFormData({ ...formData, rating_count: text })}
                placeholder="120"
                keyboardType="number-pad"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.botonCancelar} onPress={cerrarModal}>
                <Text style={styles.botonCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
                <Text style={styles.botonGuardarText}>
                  {modoEdicion ? 'Actualizar' : 'Crear'}
                </Text>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
    marginLeft: 12,
  },
  botonAgregar: {
    backgroundColor: '#221329',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
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
  productoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productoImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  productoAcciones: {
    justifyContent: 'center',
    gap: 8,
  },
  botonEditar: {
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  botonEliminar: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  botonAgregarGrande: {
    backgroundColor: '#221329',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonAgregarGrandeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonCancelarText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#221329',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonGuardarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminProductos;

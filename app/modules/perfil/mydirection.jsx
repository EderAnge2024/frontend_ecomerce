import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/context/authContext';
import {
  getUbicacionesByUser,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
} from '../../../components/services/store/ubicaciones';

export default function MyDirection() {
  const { user } = useAuth();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [direccionActual, setDireccionActual] = useState({
    id_ubicacion: null,
    nombre: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    telefono: '',
    es_principal: false,
  });

  useEffect(() => {
    if (user?.id_usuario) {
      cargarDirecciones();
    }
  }, [user]);

  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      const response = await getUbicacionesByUser(user.id_usuario);
      if (response.success) {
        setDirecciones(response.ubicaciones || []);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las direcciones');
      }
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      Alert.alert('Error', 'Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setDireccionActual({
      id_ubicacion: null,
      nombre: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      telefono: '',
      es_principal: false,
    });
    setModalVisible(true);
  };

  const abrirModalEditar = (direccion) => {
    setModoEdicion(true);
    setDireccionActual({
      id_ubicacion: direccion.id_ubicacion,
      nombre: direccion.nombre,
      direccion: direccion.direccion,
      ciudad: direccion.ciudad || '',
      codigo_postal: direccion.codigo_postal || '',
      telefono: direccion.telefono || '',
      es_principal: direccion.es_principal || false,
    });
    setModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setDireccionActual(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const guardarDireccion = async () => {
    if (!direccionActual.nombre || !direccionActual.direccion) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios (nombre y dirección)');
      return;
    }

    try {
      const ubicacionData = {
        id_usuario: user.id_usuario,
        nombre: direccionActual.nombre,
        direccion: direccionActual.direccion,
        ciudad: direccionActual.ciudad,
        codigo_postal: direccionActual.codigo_postal,
        telefono: direccionActual.telefono,
        es_principal: direccionActual.es_principal,
      };

      let response;
      if (modoEdicion && direccionActual.id_ubicacion) {
        response = await updateUbicacion(direccionActual.id_ubicacion, ubicacionData);
      } else {
        response = await createUbicacion(ubicacionData);
      }

      if (response.success) {
        Alert.alert(
          'Éxito',
          modoEdicion ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente'
        );
        setModalVisible(false);
        cargarDirecciones();
      } else {
        Alert.alert('Error', response.message || 'No se pudo guardar la dirección');
      }
    } catch (error) {
      console.error('Error guardando dirección:', error);
      Alert.alert('Error', 'Error al guardar la dirección');
    }
  };

  const eliminarDireccion = (id_ubicacion) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteUbicacion(id_ubicacion);
              if (response.success) {
                Alert.alert('Éxito', 'Dirección eliminada correctamente');
                cargarDirecciones();
              } else {
                Alert.alert('Error', response.message || 'No se pudo eliminar la dirección');
              }
            } catch (error) {
              console.error('Error eliminando dirección:', error);
              Alert.alert('Error', 'Error al eliminar la dirección');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#221329" />
        <Text style={styles.loadingText}>Cargando direcciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Ionicons name="location" size={32} color="#221329" />
          <Text style={styles.title}>Mis Direcciones</Text>
        </View>

        {direcciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptySubtext}>Agrega una dirección para recibir tus pedidos</Text>
          </View>
        ) : (
          direcciones.map((direccion) => (
            <View key={direccion.id_ubicacion} style={styles.direccionCard}>
              <View style={styles.direccionHeader}>
                <View style={styles.nombreContainer}>
                  <Text style={styles.direccionNombre}>{direccion.nombre}</Text>
                  {direccion.es_principal && (
                    <View style={styles.principalBadge}>
                      <Text style={styles.principalText}>Principal</Text>
                    </View>
                  )}
                </View>
                <View style={styles.botonesContainer}>
                  <TouchableOpacity
                    style={styles.botonEditar}
                    onPress={() => abrirModalEditar(direccion)}
                  >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botonEliminar}
                    onPress={() => eliminarDireccion(direccion.id_ubicacion)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.direccionInfo}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.direccionTexto}>{direccion.direccion}</Text>
              </View>
              
              {direccion.ciudad && (
                <View style={styles.direccionInfo}>
                  <Ionicons name="business-outline" size={16} color="#666" />
                  <Text style={styles.direccionTexto}>
                    {direccion.ciudad}{direccion.codigo_postal ? ` - ${direccion.codigo_postal}` : ''}
                  </Text>
                </View>
              )}
              
              {direccion.telefono && (
                <View style={styles.direccionInfo}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.direccionTexto}>{direccion.telefono}</Text>
                </View>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalAgregar}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.botonAgregarText}>Agregar Nueva Dirección</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para agregar/editar dirección */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {modoEdicion ? 'Editar Dirección' : 'Nueva Dirección'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre de la dirección *</Text>
                <TextInput
                  style={styles.input}
                  value={direccionActual.nombre}
                  onChangeText={(value) => handleInputChange('nombre', value)}
                  placeholder="Ej: Casa, Oficina, etc."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dirección *</Text>
                <TextInput
                  style={styles.input}
                  value={direccionActual.direccion}
                  onChangeText={(value) => handleInputChange('direccion', value)}
                  placeholder="Calle, número, departamento"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ciudad *</Text>
                <TextInput
                  style={styles.input}
                  value={direccionActual.ciudad}
                  onChangeText={(value) => handleInputChange('ciudad', value)}
                  placeholder="Ciudad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  style={styles.input}
                  value={direccionActual.codigo_postal}
                  onChangeText={(value) => handleInputChange('codigo_postal', value)}
                  placeholder="Código postal"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={direccionActual.telefono}
                  onChangeText={(value) => handleInputChange('telefono', value)}
                  placeholder="Teléfono de contacto"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleInputChange('es_principal', !direccionActual.es_principal)}
                >
                  <Ionicons
                    name={direccionActual.es_principal ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={direccionActual.es_principal ? '#4CAF50' : '#999'}
                  />
                  <Text style={styles.checkboxLabel}>Establecer como dirección principal</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.botonGuardar} onPress={guardarDireccion}>
                <Text style={styles.botonGuardarText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botonCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  scrollContent: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#221329',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  direccionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  direccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nombreContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  direccionNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
  },
  principalBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  principalText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botonEditar: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEliminar: {
    backgroundColor: '#f44336',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  direccionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  direccionTexto: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  botonAgregar: {
    flexDirection: 'row',
    backgroundColor: '#221329',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  botonAgregarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonGuardarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCancelar: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonCancelarText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginVertical: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';

export default function MyDirection() {
  const [direcciones, setDirecciones] = useState([
    {
      id: 1,
      nombre: 'Casa',
      direccion: 'Av. Principal 123',
      ciudad: 'Lima',
      codigoPostal: '15001',
      telefono: '987654321',
      referencia: 'Cerca al parque',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [direccionActual, setDireccionActual] = useState({
    id: null,
    nombre: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: '',
    referencia: '',
  });

  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setDireccionActual({
      id: null,
      nombre: '',
      direccion: '',
      ciudad: '',
      codigoPostal: '',
      telefono: '',
      referencia: '',
    });
    setModalVisible(true);
  };

  const abrirModalEditar = (direccion) => {
    setModoEdicion(true);
    setDireccionActual({ ...direccion });
    setModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setDireccionActual(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const guardarDireccion = () => {
    if (!direccionActual.nombre || !direccionActual.direccion || !direccionActual.ciudad) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    if (modoEdicion) {
      setDirecciones(prev =>
        prev.map(dir => dir.id === direccionActual.id ? direccionActual : dir)
      );
    } else {
      const nuevaDireccion = {
        ...direccionActual,
        id: Date.now(),
      };
      setDirecciones(prev => [...prev, nuevaDireccion]);
    }

    setModalVisible(false);
  };

  const eliminarDireccion = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDirecciones(prev => prev.filter(dir => dir.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Mis Direcciones</Text>

        {direcciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptySubtext}>Agrega una dirección para recibir tus pedidos</Text>
          </View>
        ) : (
          direcciones.map((direccion) => (
            <View key={direccion.id} style={styles.direccionCard}>
              <View style={styles.direccionHeader}>
                <Text style={styles.direccionNombre}>{direccion.nombre}</Text>
                <View style={styles.botonesContainer}>
                  <TouchableOpacity
                    style={styles.botonEditar}
                    onPress={() => abrirModalEditar(direccion)}
                  >
                    <Text style={styles.botonEditarText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botonEliminar}
                    onPress={() => eliminarDireccion(direccion.id)}
                  >
                    <Text style={styles.botonEliminarText}>🗑️ Borrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.direccionTexto}>{direccion.direccion}</Text>
              <Text style={styles.direccionTexto}>{direccion.ciudad} - {direccion.codigoPostal}</Text>
              <Text style={styles.direccionTexto}>Tel: {direccion.telefono}</Text>
              {direccion.referencia ? (
                <Text style={styles.direccionReferencia}>Ref: {direccion.referencia}</Text>
              ) : null}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalAgregar}>
          <Text style={styles.botonAgregarText}>+ Agregar Nueva Dirección</Text>
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
                  value={direccionActual.codigoPostal}
                  onChangeText={(value) => handleInputChange('codigoPostal', value)}
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Referencia</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={direccionActual.referencia}
                  onChangeText={(value) => handleInputChange('referencia', value)}
                  placeholder="Punto de referencia (opcional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
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
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    alignItems: 'center',
    marginBottom: 10,
  },
  direccionNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botonEditar: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  botonEditarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  botonEliminar: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  botonEliminarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  direccionTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  direccionReferencia: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  botonAgregar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonAgregarText: {
    color: '#fff',
    fontSize: 18,
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
});

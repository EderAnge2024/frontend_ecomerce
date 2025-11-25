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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../components/context/authContext';
import { getAllUsers, updateUser } from '../../../../components/services/store/users';

const AdminClientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('');
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  useEffect(() => {
    cargarClientes();
    // Verificar si el usuario actual es super admin
    setEsSuperAdmin(user?.es_super_admin === true || user?.id_usuario === 1);
  }, [user]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        setClientes(response.users || []);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los clientes');
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
      Alert.alert('Error', 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarClientes();
    setRefreshing(false);
  };

  const abrirModalCambiarRol = (cliente) => {
    setClienteSeleccionado(cliente);
    setNuevoRol(cliente.rol);
    setModalVisible(true);
  };

  const handleCambiarRol = async () => {
    if (!clienteSeleccionado || !nuevoRol) {
      Alert.alert('Error', 'Selecciona un rol');
      return;
    }

    if (nuevoRol === clienteSeleccionado.rol) {
      Alert.alert('Información', 'El rol seleccionado es el mismo que el actual');
      return;
    }

    // Solo el super admin puede crear otros administradores
    if (nuevoRol === 'administrador' && !esSuperAdmin) {
      Alert.alert(
        'Permiso Denegado',
        'Solo el administrador principal puede promover usuarios a administrador'
      );
      return;
    }

    try {
      const userData = {
        nombre: clienteSeleccionado.nombre,
        apellido: clienteSeleccionado.apellido,
        correo: clienteSeleccionado.correo,
        telefono: clienteSeleccionado.telefono,
        direccion: clienteSeleccionado.direccion,
        rol: nuevoRol,
        usuario: clienteSeleccionado.usuario,
      };

      const response = await updateUser(clienteSeleccionado.id_usuario, userData);

      if (response.success) {
        Alert.alert('Éxito', `Rol actualizado a ${nuevoRol}`);
        setModalVisible(false);
        cargarClientes();
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el rol');
      }
    } catch (error) {
      console.error('Error actualizando rol:', error);
      Alert.alert('Error', 'Error al actualizar el rol');
    }
  };

  const getRolColor = (rol) => {
    return rol === 'administrador' ? '#4CAF50' : '#2196F3';
  };

  const getRolIcon = (rol) => {
    return rol === 'administrador' ? 'shield-checkmark' : 'person';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderCliente = ({ item }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.clienteUsuario}>@{item.usuario}</Text>
          <View style={[styles.rolBadge, { backgroundColor: getRolColor(item.rol) }]}>
            <Ionicons name={getRolIcon(item.rol)} size={12} color="#fff" />
            <Text style={styles.rolText}>{item.rol}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => abrirModalCambiarRol(item)}
        >
          <Ionicons name="create-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.clienteDetalle}>
        <View style={styles.detalleRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detalleText}>{item.correo}</Text>
        </View>
        {item.telefono && (
          <View style={styles.detalleRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detalleText}>{item.telefono}</Text>
          </View>
        )}
        {item.direccion && (
          <View style={styles.detalleRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detalleText}>{item.direccion}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#221329" />
        <Text style={styles.loadingText}>Cargando clientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={32} color="#221329" />
        <Text style={styles.headerTitle}>Gestión de Clientes</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clientes.length}</Text>
          <Text style={styles.statLabel}>Total Usuarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {clientes.filter((c) => c.rol === 'cliente').length}
          </Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {clientes.filter((c) => c.rol === 'administrador').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      {clientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay usuarios registrados</Text>
        </View>
      ) : (
        <FlatList
          data={clientes}
          renderItem={renderCliente}
          keyExtractor={(item) => item.id_usuario.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal para cambiar rol */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Rol de Usuario</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {clienteSeleccionado && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.clienteInfoModal}>
                  <Text style={styles.modalClienteNombre}>
                    {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                  </Text>
                  <Text style={styles.modalClienteEmail}>
                    {clienteSeleccionado.correo}
                  </Text>
                  <Text style={styles.modalClienteUsuario}>
                    @{clienteSeleccionado.usuario}
                  </Text>
                </View>

                <Text style={styles.modalLabel}>Rol Actual:</Text>
                <View
                  style={[
                    styles.rolActualBadge,
                    { backgroundColor: getRolColor(clienteSeleccionado.rol) },
                  ]}
                >
                  <Ionicons
                    name={getRolIcon(clienteSeleccionado.rol)}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.rolActualText}>
                    {clienteSeleccionado.rol}
                  </Text>
                </View>

                <Text style={styles.modalLabel}>Seleccionar Nuevo Rol:</Text>
                <View style={styles.rolesContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rolOption,
                      nuevoRol === 'cliente' && styles.rolOptionSelected,
                    ]}
                    onPress={() => setNuevoRol('cliente')}
                  >
                    <Ionicons
                      name="person"
                      size={24}
                      color={nuevoRol === 'cliente' ? '#fff' : '#2196F3'}
                    />
                    <Text
                      style={[
                        styles.rolOptionText,
                        nuevoRol === 'cliente' && styles.rolOptionTextSelected,
                      ]}
                    >
                      Cliente
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolOption,
                      nuevoRol === 'administrador' && styles.rolOptionSelected,
                      !esSuperAdmin && styles.rolOptionDisabled,
                    ]}
                    onPress={() => esSuperAdmin && setNuevoRol('administrador')}
                    disabled={!esSuperAdmin}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={24}
                      color={nuevoRol === 'administrador' ? '#fff' : !esSuperAdmin ? '#ccc' : '#4CAF50'}
                    />
                    <Text
                      style={[
                        styles.rolOptionText,
                        nuevoRol === 'administrador' && styles.rolOptionTextSelected,
                        !esSuperAdmin && styles.rolOptionTextDisabled,
                      ]}
                    >
                      Administrador
                    </Text>
                    {!esSuperAdmin && (
                      <Ionicons name="lock-closed" size={16} color="#ccc" />
                    )}
                  </TouchableOpacity>
                </View>

                {!esSuperAdmin && (
                  <View style={[styles.warningContainer, { backgroundColor: '#FFEBEE', borderLeftColor: '#C62828' }]}>
                    <Ionicons name="information-circle-outline" size={20} color="#C62828" />
                    <Text style={[styles.warningText, { color: '#C62828' }]}>
                      Solo el administrador principal puede crear otros administradores
                    </Text>
                  </View>
                )}

                <View style={styles.warningContainer}>
                  <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
                  <Text style={styles.warningText}>
                    Los administradores pueden gestionar productos, pedidos y usuarios
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCambiarRol}
              >
                <Text style={styles.confirmButtonText}>Actualizar Rol</Text>
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
  clienteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#221329',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  clienteUsuario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rolText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  editButton: {
    padding: 8,
  },
  clienteDetalle: {
    padding: 16,
    gap: 8,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detalleText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  clienteInfoModal: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  modalClienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  modalClienteEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modalClienteUsuario: {
    fontSize: 14,
    color: '#999',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
    marginTop: 12,
  },
  rolActualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  rolActualText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rolOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  rolOptionSelected: {
    backgroundColor: '#221329',
    borderColor: '#221329',
  },
  rolOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
  },
  rolOptionTextSelected: {
    color: '#fff',
  },
  rolOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  rolOptionTextDisabled: {
    color: '#ccc',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#221329',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminClientes;

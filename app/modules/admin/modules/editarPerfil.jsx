import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../components/context/authContext';
import { updateUserInfo } from '../../../../components/services/store/users';

const EditarPerfil = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    correo: user?.correo || '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmUpdate = async () => {
    console.log('✅ Usuario confirmó la actualización');
    setShowConfirmModal(false);
    
    try {
      setLoading(true);
      console.log('Actualizando perfil...');
      console.log('ID Usuario:', user.id_usuario);
      console.log('Datos a enviar:', formData);
      
      const response = await updateUserInfo(user.id_usuario, formData);
      console.log('Respuesta del servidor:', response);

      if (response.success) {
        console.log('✅ Usuario actualizado en el servidor');
        console.log('📦 Datos del servidor:', response.user);
        
        const updatedUserData = {
          ...user,
          ...response.user,
        };
        
        console.log('✅ Actualizando contexto con:', updatedUserData);
        await updateUser(updatedUserData);
        
        setFormData({
          nombre: response.user.nombre,
          apellido: response.user.apellido,
          correo: response.user.correo,
        });
        
        Alert.alert(
          '✅ Información Actualizada',
          `Tu información ha sido actualizada correctamente.\n\nNombre: ${response.user.nombre}\nApellido: ${response.user.apellido}\nCorreo: ${response.user.correo}`
        );
      } else {
        console.error('❌ Error en respuesta:', response.message);
        Alert.alert('❌ Error', response.message || 'No se pudo actualizar la información');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la información: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log('🔘 handleSubmit llamado');
    console.log('📋 FormData:', formData);
    console.log('👤 User:', user);
    
    if (!formData.nombre.trim()) {
      console.log('❌ Nombre vacío');
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!formData.apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return;
    }

    if (!formData.correo.trim()) {
      Alert.alert('Error', 'El correo es requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Alert.alert('Error', 'El formato del correo no es válido');
      return;
    }

    console.log('✅ Validaciones pasadas, mostrando modal de confirmación...');
    setShowConfirmModal(true);
  };

  const handleReset = () => {
    setFormData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      correo: user?.correo || '',
    });
  };

  const hasChanges = () => {
    return (
      formData.nombre !== user?.nombre ||
      formData.apellido !== user?.apellido ||
      formData.correo !== user?.correo
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={32} color="#221329" />
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>Actualiza tu información personal</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.apellido}
              onChangeText={(value) => handleChange('apellido', value)}
              placeholder="Ingresa tu apellido"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.correo}
              onChangeText={(value) => handleChange('correo', value)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyTitle}>Información de la Cuenta</Text>
          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>Usuario:</Text>
            <Text style={styles.readOnlyValue}>{user?.usuario}</Text>
          </View>
          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>Rol:</Text>
            <Text style={styles.readOnlyValue}>{user?.rol}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={loading || !hasChanges()}
          >
            <Ionicons name="refresh-outline" size={20} color="#666" />
            <Text style={styles.resetButtonText}>Restablecer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!hasChanges() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || !hasChanges()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Confirmación */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-circle" size={50} color="#FF9800" />
              <Text style={styles.modalTitle}>Confirmar Cambios</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              ¿Estás seguro que deseas actualizar tu información?
            </Text>
            
            <View style={styles.modalChanges}>
              <View style={styles.changeItem}>
                <Text style={styles.changeLabel}>Nombre:</Text>
                <Text style={styles.changeValue}>{formData.nombre}</Text>
              </View>
              <View style={styles.changeItem}>
                <Text style={styles.changeLabel}>Apellido:</Text>
                <Text style={styles.changeValue}>{formData.apellido}</Text>
              </View>
              <View style={styles.changeItem}>
                <Text style={styles.changeLabel}>Correo:</Text>
                <Text style={styles.changeValue}>{formData.correo}</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log('❌ Usuario canceló la actualización');
                  setShowConfirmModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmUpdate}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  readOnlySection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  readOnlyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  readOnlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#666',
  },
  readOnlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#221329',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalChanges: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  changeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  changeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  changeValue: {
    fontSize: 14,
    color: '#221329',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#221329',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditarPerfil;

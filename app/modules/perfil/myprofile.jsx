import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/context/authContext';
import { updateUserInfo } from '../../../components/services/store/users';

export default function MyProfile() {
  // Obtener el usuario actual del contexto de autenticación
  const { user, refreshUser } = useAuth();
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    correo: '',
  });

  // Estado para controlar si está guardando
  const [saving, setSaving] = useState(false);
  
  // Estado para controlar si hay cambios sin guardar
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        correo: user.correo || '',
      });
    }
  }, [user]);

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true); // Marcar que hay cambios
  };

  // Guardar los cambios del perfil
  const handleSave = async () => {
    // Validar que los campos obligatorios no estén vacíos
    if (!formData.nombre || !formData.apellido || !formData.correo) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios: Nombre, Apellido y Correo');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Guardando perfil del usuario:', user.id_usuario);
      
      // Llamar a la API para actualizar la información
      const response = await updateUserInfo(user.id_usuario, formData);
      
      if (response.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setHasChanges(false);
        
        // Refrescar los datos del usuario en el contexto
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y restaurar los datos originales
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Cancelar cambios',
        '¿Estás seguro de que deseas descartar los cambios?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, descartar',
            style: 'destructive',
            onPress: () => {
              // Restaurar los datos originales del usuario
              if (user) {
                setFormData({
                  nombre: user.nombre || '',
                  apellido: user.apellido || '',
                  telefono: user.telefono || '',
                  direccion: user.direccion || '',
                  correo: user.correo || '',
                });
                setHasChanges(false);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con ícono */}
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#221329" />
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Actualiza tu información personal</Text>
        </View>

        {/* Información del usuario */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#666" />
            <Text style={styles.infoLabel}>Usuario:</Text>
            <Text style={styles.infoValue}>{user?.usuario || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#666" />
            <Text style={styles.infoLabel}>Rol:</Text>
            <Text style={[styles.infoValue, styles.rolBadge]}>
              {user?.rol || 'cliente'}
            </Text>
          </View>
        </View>

        {/* Formulario de edición */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nombre <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(value) => handleInputChange('nombre', value)}
              placeholder="Ingrese su nombre"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Apellido <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.apellido}
              onChangeText={(value) => handleInputChange('apellido', value)}
              placeholder="Ingrese su apellido"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Correo Electrónico <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.correo}
              onChangeText={(value) => handleInputChange('correo', value)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              placeholder="Ingrese su teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dirección</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.direccion}
              onChangeText={(value) => handleInputChange('direccion', value)}
              placeholder="Ingrese su dirección"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </View>

        {/* Indicador de cambios */}
        {hasChanges && (
          <View style={styles.changesIndicator}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <Text style={styles.changesText}>Tienes cambios sin guardar</Text>
          </View>
        )}

        {/* Botones de acción */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>

        {hasChanges && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={saving}
          >
            <Ionicons name="close-circle-outline" size={24} color="#666" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.required}>*</Text> Campos obligatorios
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#221329',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#221329',
    fontWeight: '500',
  },
  rolBadge: {
    backgroundColor: '#221329',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  changesText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#221329',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    gap: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
    
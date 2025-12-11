import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/context/authContext';
import { updateCredentials } from '../../../components/services/store/users';

export default function ChangeCredentials({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    usuario: user?.usuario || '',
    contrasena: '',
    confirmarContrasena: ''
  });

  // Actualizar el formulario cuando el usuario cambie
  useEffect(() => {
    if (user?.usuario) {
      setFormData(prev => ({
        ...prev,
        usuario: user.usuario
      }));
    }
  }, [user?.usuario]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.usuario.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return false;
    }

    if (formData.usuario.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    // Validar que el usuario solo contenga caracteres alfanuméricos y algunos especiales
    const usuarioRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usuarioRegex.test(formData.usuario)) {
      Alert.alert('Error', 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
      return false;
    }

    if (!formData.contrasena) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return false;
    }

    if (formData.contrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const credentials = {
        usuario: formData.usuario.trim(),
        contrasena: formData.contrasena
      };

      console.log('🚀 Enviando credenciales al backend...');
      console.log('👤 Usuario ID:', user.id_usuario);
      console.log('📝 Credenciales:', { usuario: credentials.usuario, contrasena: '***' });
      
      const response = await updateCredentials(user.id_usuario, credentials);
      
      console.log('📡 Respuesta del backend:', response);

      if (response.success) {
        console.log('✅ Credenciales actualizadas exitosamente');
        console.log('📦 Usuario actualizado:', response.user);
        
        // Actualizar el usuario en el contexto
        await updateUser(response.user);
        
        // Actualizar el estado local del formulario con el nuevo usuario
        setFormData(prev => ({
          usuario: response.user.usuario,
          contrasena: '',
          confirmarContrasena: ''
        }));
        
        console.log('🔄 Estado del formulario actualizado:', {
          usuario: response.user.usuario,
          contrasena: '',
          confirmarContrasena: ''
        });
        
        Alert.alert(
          'Éxito', 
          'Credenciales actualizadas correctamente',
          [{ 
            text: 'OK',
            onPress: () => {
              // Llamar callback si existe
              if (onSuccess) {
                onSuccess();
              }
            }
          }]
        );
      } else {
        console.log('❌ Error en respuesta:', response.message);
        Alert.alert('Error', response.message || 'Error al actualizar credenciales');
      }
    } catch (error) {
      console.error('Error actualizando credenciales:', error);
      Alert.alert('Error', 'Error al actualizar credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="key" size={40} color="#221329" />
        <Text style={styles.title}>Cambiar Credenciales</Text>
        <Text style={styles.subtitle}>Actualiza tu nombre de usuario y contraseña</Text>
      </View>

      <View style={styles.form}>
        {/* Usuario */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de Usuario</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.usuario}
              onChangeText={(value) => handleInputChange('usuario', value)}
              placeholder="Ingresa tu nombre de usuario"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Nueva Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.contrasena}
              onChangeText={(value) => handleInputChange('contrasena', value)}
              placeholder="Ingresa tu nueva contraseña"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.confirmarContrasena}
              onChangeText={(value) => handleInputChange('confirmarContrasena', value)}
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de seguridad */}
        <View style={styles.securityInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.securityText}>
            La contraseña debe tener al menos 6 caracteres
          </Text>
        </View>

        {/* Debug Info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Usuario actual: {user?.usuario}</Text>
          <Text style={styles.debugText}>Usuario en formulario: {formData.usuario}</Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Actualizar Credenciales</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 25,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#221329',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});
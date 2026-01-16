import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/context/authContext';
import { useRouter } from 'expo-router';
import InputValidator from '../../components/security/InputValidator';
import SecureLogger from '../../components/security/SecureLogger';

const Register = ({ onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validatePassword = (password) => {
    if (!password || password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Requiere al menos 3 de los 4 tipos de caracteres
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    return criteriaCount >= 3;
  };

  const getPasswordRequirements = () => {
    return 'La contraseña debe tener:\n• Mínimo 8 caracteres\n• Al menos 3 de estos tipos:\n  - Mayúsculas (A-Z)\n  - Minúsculas (a-z)\n  - Números (0-9)\n  - Símbolos (!@#$%^&*)';
  };

  const handleRegister = async () => {
    // Validaciones básicas
    if (!nombre || !correo || !usuario || !password) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios: nombre, correo, usuario y contraseña');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validar datos con InputValidator
    const userData = {
      nombre,
      apellido: apellido || '',
      correo,
      telefono: telefono || '',
      direccion: direccion || '',
      usuario,
      contrasena: password,
    };

    const validation = InputValidator.validateRegistrationData(userData);

    if (!validation.isValid) {
      Alert.alert('Error de validación', validation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      SecureLogger.auth('Iniciando proceso de registro');

      const registrationData = {
        ...validation.sanitized,
        rol: 'cliente', // Por defecto siempre cliente
      };

      const response = await register(registrationData);
      
      if (response.success) {
        SecureLogger.success('Registro exitoso');
        Alert.alert('¡Éxito!', '¡Registro exitoso! Tu cuenta ha sido creada correctamente');
        
        // Si hay callback onSuccess (cuando se usa en modal), ejecutarlo
        if (onSuccess) {
          onSuccess();
        }
        // No navegar aquí - el componente padre maneja la navegación
      } else {
        SecureLogger.warn('Registro falló');
        // Mostrar mensaje específico del backend
        const errorMessage = response.message || 'No se pudo crear la cuenta';
        
        // Si el error es sobre contraseña, mostrar los requisitos
        if (errorMessage.toLowerCase().includes('contraseña') || errorMessage.toLowerCase().includes('password')) {
          Alert.alert('Error de contraseña', `${errorMessage}\n\n${getPasswordRequirements()}`);
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      SecureLogger.error('Error en proceso de registro', error);
      Alert.alert('Error', 'Ocurrió un error al registrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

          {/* Campo de Nombre */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* Campo de Apellido */}
          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Apellido (opcional)"
              placeholderTextColor="#999"
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
            />
          </View>

          {/* Campo de Usuario */}
          <View style={styles.inputContainer}>
            <Ionicons name="at-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario *"
              placeholderTextColor="#999"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          {/* Campo de Teléfono */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono (opcional)"
              placeholderTextColor="#999"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          {/* Campo de Dirección */}
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Dirección (opcional)"
              placeholderTextColor="#999"
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>

          {/* Campo de Correo */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico *"
              placeholderTextColor="#999"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Campo de Contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Requisitos de contraseña */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
            <Text style={styles.requirementsText}>• Mínimo 8 caracteres</Text>
            <Text style={styles.requirementsText}>• Al menos 3 de estos tipos:</Text>
            <Text style={styles.requirementsSubText}>  - Mayúsculas (A-Z)</Text>
            <Text style={styles.requirementsSubText}>  - Minúsculas (a-z)</Text>
            <Text style={styles.requirementsSubText}>  - Números (0-9)</Text>
            <Text style={styles.requirementsSubText}>  - Símbolos (!@#$%^&*)</Text>
          </View>

          {/* Campo de Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  userTypeContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#221329',
    backgroundColor: '#fff',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#221329',
    borderColor: '#221329',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#221329',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#221329',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#221329',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 6,
  },
  requirementsText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  requirementsSubText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 1,
  },
});

export default Register;

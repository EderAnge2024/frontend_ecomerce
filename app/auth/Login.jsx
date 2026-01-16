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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/context/authContext';
import { useRouter } from 'expo-router';
import Register from './Register';
import RecuperarPassword from './RecuperarPassword';
import AdminHome from '../modules/admin/AdminHome';
import InputValidator from '../../components/security/InputValidator';
import SecureLogger from '../../components/security/SecureLogger';

const Login = ({ onSuccess, onForgotPassword, onRegister }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { login, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log('🔐 handleLogin iniciado');
    console.log('   Usuario:', usuario);
    console.log('   Password length:', password?.length);
    
    // Validación básica
    if (!usuario || !password) {
      console.log('❌ Campos vacíos');
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar datos de entrada con InputValidator
    console.log('🔍 Validando con InputValidator...');
    const loginValidation = InputValidator.validateLoginData({
      usuario: usuario,
      contrasena: password
    });

    console.log('🔍 Resultado validación:', loginValidation);

    if (!loginValidation.isValid) {
      console.log('❌ Validación falló:', loginValidation.errors);
      Alert.alert('Error de validación', loginValidation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Iniciando login...');
      
      const response = await login(loginValidation.sanitized.usuario, password);
      
      console.log('📋 Respuesta login:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ Login exitoso');
        
        // Mostrar mensaje de éxito
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
        
        // Siempre ejecutar el callback para que PerfilScreen se actualice
        console.log('🔄 Ejecutando callback para actualizar PerfilScreen');
        
        if (onSuccess) {
          console.log('🔄 Ejecutando onSuccess callback');
          // Dar tiempo para que el AuthContext se actualice completamente
          setTimeout(() => {
            onSuccess();
          }, 200);
        }
      } else {
        console.log('❌ Login falló:', response.message);
        Alert.alert('Error de autenticación', response.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      setShowRecoveryModal(true);
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      setShowRegisterModal(true);
    }
  };

  // Si el usuario es admin, mostrar el panel de administración
  if (showAdminPanel) {
    return <AdminHome />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Bienvenido de nuevo</Text>



          {/* Campo de Usuario */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#999"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
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

          {/* Botón Olvidaste tu contraseña */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de Login */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Link a Registro */}
          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerLinkText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Registro */}
      <Modal visible={showRegisterModal} animationType="slide">
        <View style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowRegisterModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={32} color="#221329" />
            </TouchableOpacity>
          </View>
          <Register onSuccess={() => setShowRegisterModal(false)} />
        </View>
      </Modal>

      {/* Modal de Recuperar Contraseña */}
      <Modal visible={showRecoveryModal} animationType="slide">
        <View style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowRecoveryModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={32} color="#221329" />
            </TouchableOpacity>
          </View>
          <RecuperarPassword />
        </View>
      </Modal>
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
    justifyContent: 'center',
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
    marginBottom: 40,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#221329',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#221329',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#221329',
    fontWeight: '600',
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
});

export default Login;

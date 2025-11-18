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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('comprador'); // 'comprador' o 'vendedor'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Aquí puedes agregar la lógica de registro
    console.log({
      nombre,
      apellidos,
      celular,
      email,
      dni,
      fechaNacimiento,
      tipoUsuario,
      password,
    });
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

          {/* Campo de Apellidos */}
          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              placeholderTextColor="#999"
              value={apellidos}
              onChangeText={setApellidos}
              autoCapitalize="words"
            />
          </View>

          {/* Campo de DNI */}
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="DNI"
              placeholderTextColor="#999"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
              maxLength={8}
            />
          </View>

          {/* Campo de Fecha de Nacimiento */}
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Fecha de Nacimiento (DD/MM/AAAA)"
              placeholderTextColor="#999"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Campo de Número de Celular */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Número de celular"
              placeholderTextColor="#999"
              value={celular}
              onChangeText={setCelular}
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>

          {/* Campo de Correo */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
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

          {/* Selector de Tipo de Usuario */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>Tipo de Usuario</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  tipoUsuario === 'comprador' && styles.userTypeButtonActive,
                ]}
                onPress={() => setTipoUsuario('comprador')}
              >
                <Ionicons
                  name="cart-outline"
                  size={24}
                  color={tipoUsuario === 'comprador' ? '#fff' : '#221329'}
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    tipoUsuario === 'comprador' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Comprador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  tipoUsuario === 'vendedor' && styles.userTypeButtonActive,
                ]}
                onPress={() => setTipoUsuario('vendedor')}
              >
                <Ionicons
                  name="storefront-outline"
                  size={24}
                  color={tipoUsuario === 'vendedor' ? '#fff' : '#221329'}
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    tipoUsuario === 'vendedor' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Vendedor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {/* Link a Login */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity>
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
});

export default Register;

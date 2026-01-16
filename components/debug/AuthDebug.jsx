import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { 
  getPedidosByUser, 
  getPedidosByAdmin, 
  createPedido 
} from '../services/store/pedidos';
import { getProductosByUser } from '../services/store/productos';
import SecureLogger from '../security/SecureLogger';
import { ENV_CONFIG } from '../../config/env.js';

// Solo mostrar en desarrollo
if (!__DEV__ || !ENV_CONFIG.DEBUG_MODE) {
  // Componente vacío para producción
  const AuthDebug = () => null;
  export default AuthDebug;
} else {
  // Componente completo para desarrollo

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const { SecureStorageManager } = await import('../security/SecureStorage');
      const token = await SecureStorageManager.getToken();
      const userData = await SecureStorageManager.getUser();
      
      setDebugInfo({
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasUser: !!userData,
        userFromStorage: userData,
        userFromContext: user,
        isAuthenticated,
      });
    } catch (error) {
      SecureLogger.error('Error loading debug info', error);
    }
  };

  const testEndpoint = async (name, testFunction) => {
    try {
      SecureLogger.debug(`Testing ${name}...`);
      const result = await testFunction();
      SecureLogger.success(`${name} success`, result);
      return { success: true, data: result };
    } catch (error) {
      SecureLogger.error(`${name} error`, error);
      return { success: false, error: error.message };
    }
  };

  const runTests = async () => {
    if (!user) {
      Alert.alert('Error', 'No hay usuario logueado');
      return;
    }

    setTesting(true);
    const results = {};

    // Test 1: Obtener productos del usuario
    results.productos = await testEndpoint(
      'Productos del usuario',
      () => getProductosByUser(user.id_usuario)
    );

    // Test 2: Obtener pedidos del usuario
    results.pedidosUsuario = await testEndpoint(
      'Pedidos del usuario',
      () => getPedidosByUser(user.id_usuario)
    );

    // Test 3: Obtener pedidos del admin (si es admin)
    if (user.rol === 'administrador') {
      results.pedidosAdmin = await testEndpoint(
        'Pedidos del admin',
        () => getPedidosByAdmin(user.id_usuario)
      );
    }

    // Test 4: Crear pedido de prueba
    results.crearPedido = await testEndpoint(
      'Crear pedido de prueba',
      () => createPedido({
        id_usuario: user.id_usuario,
        total: 1.00
      })
    );

    setTesting(false);

    // Mostrar resultados
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    Alert.alert(
      'Resultados de Pruebas',
      `✅ Exitosas: ${successCount}/${totalTests}\n\n` +
      Object.entries(results).map(([key, result]) => 
        `${result.success ? '✅' : '❌'} ${key}: ${result.success ? 'OK' : result.error}`
      ).join('\n'),
      [{ text: 'OK' }]
    );
  };

  const clearStorage = async () => {
    try {
      const { SecureStorageManager } = await import('../security/SecureStorage');
      await SecureStorageManager.clearAllSecureData();
      Alert.alert('Éxito', 'Storage seguro limpiado');
      loadDebugInfo();
    } catch (error) {
      SecureLogger.error('Error limpiando storage', error);
      Alert.alert('Error', 'No se pudo limpiar el storage');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bug" size={32} color="#221329" />
        <Text style={styles.title}>Debug de Autenticación</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Autenticación</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Autenticado:</Text>
          <Text style={[styles.value, { color: isAuthenticated ? '#4CAF50' : '#F44336' }]}>
            {isAuthenticated ? 'SÍ' : 'NO'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Token en Storage:</Text>
          <Text style={[styles.value, { color: debugInfo.hasToken ? '#4CAF50' : '#F44336' }]}>
            {debugInfo.hasToken ? `SÍ (${debugInfo.tokenLength} chars)` : 'NO'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Usuario en Storage:</Text>
          <Text style={[styles.value, { color: debugInfo.hasUser ? '#4CAF50' : '#F44336' }]}>
            {debugInfo.hasUser ? 'SÍ' : 'NO'}
          </Text>
        </View>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Usuario</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{user.id_usuario}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Usuario:</Text>
            <Text style={styles.value}>{user.usuario}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol:</Text>
            <Text style={styles.value}>{user.rol}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Super Admin:</Text>
            <Text style={styles.value}>{user.es_super_admin ? 'SÍ' : 'NO'}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones de Prueba</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={runTests}
          disabled={testing || !user}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {testing ? 'Probando...' : 'Probar Endpoints'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]} 
          onPress={loadDebugInfo}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Actualizar Info</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearStorage}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Limpiar Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instrucciones</Text>
        <Text style={styles.instructions}>
          1. Verifica que tengas token y usuario en storage{'\n'}
          2. Ejecuta las pruebas de endpoints{'\n'}
          3. Si fallan, revisa los logs de la consola{'\n'}
          4. Los errores 401 indican problemas de autenticación
        </Text>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#221329',
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AuthDebug;

} // Cierre del bloque condicional de desarrollo
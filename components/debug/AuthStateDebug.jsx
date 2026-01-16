import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/authContext';

const AuthStateDebug = () => {
  const { user, isAuthenticated, isAdmin, loading, authVersion } = useAuth();

  useEffect(() => {
    console.log('🔍 AuthStateDebug - Estado actualizado:', {
      timestamp: new Date().toISOString(),
      authVersion,
      isAuthenticated,
      hasUser: !!user,
      userRol: user?.rol,
      userAdmin: user?.es_super_admin,
      isAdminFunction: isAdmin(),
      loading
    });
  }, [user, isAuthenticated, isAdmin, loading, authVersion]);

  // Solo mostrar en modo debug Y solo para super administradores
  if (!__DEV__) return null;
  
  // Solo mostrar para usuarios con es_super_admin: true
  if (!user || !user.es_super_admin) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debug</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? '✅' : '❌'}</Text>
      <Text style={styles.text}>User: {user ? `${user.nombre} (${user.rol})` : 'None'}</Text>
      <Text style={styles.text}>Is Admin: {isAdmin() ? '✅' : '❌'}</Text>
      <Text style={styles.text}>Super Admin: {user?.es_super_admin ? '✅' : '❌'}</Text>
      <Text style={styles.text}>Loading: {loading ? '⏳' : '✅'}</Text>
      <Text style={styles.text}>Version: {authVersion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // Más abajo para evitar botones del sistema
    left: 10, // Cambiar a la izquierda para evitar botones de navegación
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 8,
    borderRadius: 8,
    zIndex: 999, // Reducir z-index para que no interfiera tanto
    maxWidth: 200, // Limitar ancho
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    color: '#4CAF50', // Color verde para super admin
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    color: 'white',
    fontSize: 9,
    marginBottom: 1,
    lineHeight: 12,
  },
});

export default AuthStateDebug;
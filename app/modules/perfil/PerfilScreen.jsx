import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function PerfilScreen() {




  
  const handlePress = (section) => {
    console.log(`Navegando a: ${section}`);
    // Aquí puedes agregar la navegación real más adelante
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header del Perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
        <Text style={styles.userName}>Juan Pérez</Text>
        <Text style={styles.userEmail}>juan.perez@email.com</Text>
      </View>

      {/* Opciones del Menú */}
      <View style={styles.menuContainer}>
        
        {/* Mi Perfil */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handlePress('Mi Perfil')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Mi Perfil</Text>
            <Text style={styles.menuSubtitle}>Editar información personal</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Mis Direcciones */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handlePress('Mis Direcciones')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Mis Direcciones</Text>
            <Text style={styles.menuSubtitle}>Gestionar direcciones de envío</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Mis Compras */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handlePress('Mis Compras')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.iconText}>🛍️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Mis Compras</Text>
            <Text style={styles.menuSubtitle}>Historial de pedidos</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Contáctanos */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handlePress('Contáctanos')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.iconText}>💬</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Contáctanos</Text>
            <Text style={styles.menuSubtitle}>Soporte y ayuda</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Cerrar Sesión */}
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={() => handlePress('Cerrar Sesión')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.iconText}>🚪</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, styles.logoutText]}>Cerrar Sesión</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 22,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  arrow: {
    fontSize: 28,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutItem: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffebee',
    backgroundColor: '#fff',
  },
  logoutText: {
    color: '#f44336',
  },
});

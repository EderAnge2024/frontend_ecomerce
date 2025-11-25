import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/context/authContext';
import { useNavigation } from '@react-navigation/native';
import AdminPedidos from './modules/pedidos';
import AdminProductos from './modules/productos';
import AdminClientes from './modules/clientes';
import CambiarPassword from './modules/cambiarPassword';
import EditarPerfil from './modules/editarPerfil';

export default function AdminHome() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [checking, setChecking] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Verificar permisos al cargar el componente
  useEffect(() => {
    const checkPermissions = () => {
      console.log('🔍 Verificando permisos de acceso...');
      console.log('Usuario:', user);
      console.log('Autenticado:', isAuthenticated);
      console.log('Es Admin:', isAdmin());

      if (!isAuthenticated) {
        console.log('❌ No autenticado, redirigiendo a Perfil...');
        Alert.alert(
          'Acceso Denegado',
          'Debes iniciar sesión para acceder al panel de administración',
          [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Perfil' }) }]
        );
        return;
      }

      if (!isAdmin()) {
        console.log('❌ No es administrador, redirigiendo a Inicio...');
        Alert.alert(
          '🚫 Acceso Denegado',
          'No tienes el nivel de administrador necesario para acceder a este panel.\n\nTu rol actual: ' + (user?.rol || 'cliente'),
          [{ text: 'Entendido', onPress: () => navigation.navigate('MainTabs', { screen: 'Inicio' }) }]
        );
        return;
      }

      console.log('✅ Permisos verificados correctamente');
      setChecking(false);
    };

    checkPermissions();
  }, [user, isAuthenticated, isAdmin]);

  // Mostrar loading mientras verifica permisos
  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a0f21" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    console.log('🔘 handleLogout llamado');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('✅ Usuario confirmó cerrar sesión');
    setShowLogoutModal(false);
    
    try {
      console.log('🚪 Cerrando sesión...');
      await logout();
      console.log('✅ Sesión cerrada, redirigiendo a MainTabs...');
      // Navegar a MainTabs (que contiene Inicio, Menú, Perfil)
      navigation.navigate('MainTabs', { screen: 'Perfil' });
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <ScrollView style={styles.dashboardContainer}>
            <Text style={styles.welcomeText}>
              Bienvenido, {user?.nombre} {user?.apellido}
            </Text>
            <Text style={styles.welcomeSubtext}>
              Panel de Administración - E-commerce
            </Text>

            {/* Cards de acceso rápido */}
            <View style={styles.cardsContainer}>
              <TouchableOpacity
                style={[styles.card, styles.cardPedidos]}
                onPress={() => setActiveSection('pedidos')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="receipt" size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Gestionar Pedidos</Text>
                <Text style={styles.cardDescription}>
                  Ver y administrar todos los pedidos
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.cardProductos]}
                onPress={() => setActiveSection('productos')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="cube" size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Ver Productos</Text>
                <Text style={styles.cardDescription}>
                  Catálogo completo de productos
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.cardClientes]}
                onPress={() => setActiveSection('clientes')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="people" size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Gestionar Clientes</Text>
                <Text style={styles.cardDescription}>
                  Ver usuarios y cambiar roles
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.cardPassword]}
                onPress={() => setActiveSection('password')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="key" size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Cambiar Contraseña</Text>
                <Text style={styles.cardDescription}>
                  Actualiza tu contraseña de acceso
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, styles.cardPerfil]}
                onPress={() => setActiveSection('perfil')}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="person-circle" size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Editar Perfil</Text>
                <Text style={styles.cardDescription}>
                  Actualiza tu información personal
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Información del admin */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Información de la Cuenta</Text>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {user?.nombre} {user?.apellido}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={20} color="#666" />
                <Text style={styles.infoText}>{user?.correo}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color="#666" />
                <Text style={styles.infoText}>Rol: {user?.rol}</Text>
              </View>
            </View>

            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
              <View style={styles.logoutCardContent}>
                <Ionicons name="log-out-outline" size={32} color="#fff" />
                <View style={styles.logoutTextContainer}>
                  <Text style={styles.logoutTitle}>Cerrar Sesión</Text>
                  <Text style={styles.logoutSubtitle}>Salir del panel de administración</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'pedidos':
        return <AdminPedidos />;
      case 'productos':
        return <AdminProductos />;
      case 'clientes':
        return <AdminClientes />;
      case 'password':
        return <CambiarPassword />;
      case 'perfil':
        return <EditarPerfil />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0f21" />
      
      {/* Header con gradiente */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => setActiveSection('dashboard')}
            style={styles.headerLeft}
          >
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Panel Admin</Text>
              <Text style={styles.headerSubtitle}>E-commerce System</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Navegación */}
        {activeSection !== 'dashboard' && (
          <View style={styles.breadcrumb}>
            <TouchableOpacity
              onPress={() => setActiveSection('dashboard')}
              style={styles.breadcrumbItem}
            >
              <Ionicons name="home" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.breadcrumbText}>Inicio</Text>
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.breadcrumbTextActive}>
              {activeSection === 'pedidos' && 'Pedidos'}
              {activeSection === 'productos' && 'Productos'}
              {activeSection === 'clientes' && 'Clientes'}
              {activeSection === 'password' && 'Cambiar Contraseña'}
              {activeSection === 'perfil' && 'Editar Perfil'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Modal de Confirmación de Logout */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out" size={50} color="#dc3545" />
              <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              ¿Estás seguro que deseas cerrar sesión?
            </Text>
            
            <View style={styles.modalInfo}>
              <Ionicons name="information-circle" size={20} color="#666" />
              <Text style={styles.modalInfoText}>
                Serás redirigido a la pantalla de inicio
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log('❌ Usuario canceló cerrar sesión');
                  setShowLogoutModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={confirmLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutConfirmButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1a0f21',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  breadcrumbTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a0f21',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPedidos: {
    backgroundColor: '#4CAF50',
  },
  cardProductos: {
    backgroundColor: '#2196F3',
  },
  cardClientes: {
    backgroundColor: '#E91E63',
  },
  cardPassword: {
    backgroundColor: '#FF9800',
  },
  cardPerfil: {
    backgroundColor: '#9C27B0',
  },
  cardIcon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a0f21',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  logoutCard: {
    backgroundColor: '#dc3545',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoutCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  logoutSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});

const modalStyles = StyleSheet.create({
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
    marginBottom: 16,
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
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
  logoutConfirmButton: {
    backgroundColor: '#dc3545',
  },
  logoutConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

// Combinar estilos
Object.assign(styles, modalStyles);

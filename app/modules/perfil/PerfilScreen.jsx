import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../components/context/authContext';
import { useNavigation } from '@react-navigation/native';
import { getPedidosByUser } from '../../../components/services/store/pedidos';
import Login from '../../auth/Login';
import Register from '../../auth/Register';
import RecuperarPassword from '../../auth/RecuperarPassword';
import MyProfile from './myprofile';
import MyDirection from './mydirection';
import MyContactenos from './mycontactenos';

export default function PerfilScreen() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  
  // Estados para modales
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Estados para pedidos
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      alert('Sesión cerrada correctamente');
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  const loadPedidos = async () => {
    if (!user?.id_usuario) return;
    
    try {
      setLoadingPedidos(true);
      const response = await getPedidosByUser(user.id_usuario);
      
      if (response.success) {
        setPedidos(response.pedidos || []);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleVerPedidos = () => {
    setShowPedidosModal(true);
    loadPedidos();
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Si no está autenticado, mostrar opciones de login/registro
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.notAuthContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#221329" />
          <Text style={styles.notAuthTitle}>Bienvenido</Text>
          <Text style={styles.notAuthText}>Inicia sesión o regístrate para continuar</Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              console.log('🔘 Click en Iniciar Sesión');
              setShowLoginModal(true);
            }}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              console.log('🔘 Click en Registrarse');
              setShowRegisterModal(true);
            }}
          >
            <Ionicons name="person-add-outline" size={20} color="#221329" />
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => {
              console.log('🔘 Click en Olvidaste tu contraseña');
              setShowRecoveryModal(true);
            }}
          >
            <Text style={styles.linkButtonText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de Login */}
        <Modal 
          visible={showLoginModal} 
          animationType="slide"
          onShow={() => console.log('📱 Modal de Login mostrado')}
        >
          <View style={styles.modalFullScreen}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('❌ Cerrando modal de Login');
                  setShowLoginModal(false);
                }} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={32} color="#221329" />
              </TouchableOpacity>
            </View>
            <Login 
              onSuccess={() => {
                console.log('✅ Login exitoso, cerrando modal');
                setShowLoginModal(false);
              }}
              onForgotPassword={() => {
                console.log('🔄 Cambiando a modal de recuperación');
                setShowLoginModal(false);
                setShowRecoveryModal(true);
              }}
              onRegister={() => {
                console.log('🔄 Cambiando a modal de registro');
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
            />
          </View>
        </Modal>

        {/* Modal de Registro */}
        <Modal 
          visible={showRegisterModal} 
          animationType="slide"
          onShow={() => console.log('📱 Modal de Registro mostrado')}
        >
          <View style={styles.modalFullScreen}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('❌ Cerrando modal de Registro');
                  setShowRegisterModal(false);
                }} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={32} color="#221329" />
              </TouchableOpacity>
            </View>
            <Register 
              onSuccess={() => {
                console.log('✅ Registro exitoso, cerrando modal');
                setShowRegisterModal(false);
              }} 
            />
          </View>
        </Modal>

        {/* Modal de Recuperación */}
        <Modal 
          visible={showRecoveryModal} 
          animationType="slide"
          onShow={() => console.log('📱 Modal de Recuperación mostrado')}
        >
          <View style={styles.modalFullScreen}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('❌ Cerrando modal de Recuperación');
                  setShowRecoveryModal(false);
                }} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={32} color="#221329" />
              </TouchableOpacity>
            </View>
            <RecuperarPassword />
          </View>
        </Modal>
      </View>
    );
  }

  // Usuario autenticado
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header del Perfil */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
          <Text style={styles.userEmail}>{user?.correo}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.rol}</Text>
          </View>
        </View>

        {/* Opciones del Menú */}
        <View style={styles.menuContainer}>
          {/* Panel de Admin (solo para admins) */}
          {isAdmin() && (
            <TouchableOpacity 
              style={[styles.menuItem, styles.adminItem]}
              onPress={() => navigation.navigate('AdminHome')}
            >
              <View style={[styles.menuIcon, styles.adminIcon]}>
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, styles.adminText]}>Panel de Administrador</Text>
                <Text style={styles.menuSubtitle}>Gestionar pedidos y productos</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
            </TouchableOpacity>
          )}

          {/* Mis Perfil */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={24} color="#221329" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mi Perfil</Text>
              <Text style={styles.menuSubtitle}>Editar información personal</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          {/* Mis Direcciones */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowDirectionModal(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="location-outline" size={24} color="#221329" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mis Direcciones</Text>
              <Text style={styles.menuSubtitle}>Gestionar direcciones de envío</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Mis Pedidos */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleVerPedidos}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="receipt-outline" size={24} color="#221329" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mis Pedidos</Text>
              <Text style={styles.menuSubtitle}>Ver historial de compras</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Contactenos */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowContactModal(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="call-outline" size={24} color="#221329" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Contáctenos</Text>
              <Text style={styles.menuSubtitle}>Comunícate con nosotros</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Cerrar Sesión */}
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="log-out-outline" size={24} color="#dc3545" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Cerrar Sesión</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Logout */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="log-out" size={50} color="#dc3545" />
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalDescription}>
              ¿Estás seguro que deseas cerrar sesión?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Pedidos */}
      <Modal visible={showPedidosModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.pedidosModal]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Mis Pedidos</Text>
              <TouchableOpacity onPress={() => setShowPedidosModal(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {loadingPedidos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#221329" />
                <Text style={styles.loadingText}>Cargando pedidos...</Text>
              </View>
            ) : pedidos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No tienes pedidos aún</Text>
                <Text style={styles.emptySubtext}>Tus compras aparecerán aquí</Text>
              </View>
            ) : (
              <ScrollView style={styles.pedidosList}>
                {pedidos.map((pedido) => (
                  <View key={pedido.id_pedido} style={styles.pedidoCard}>
                    <View style={styles.pedidoHeader}>
                      <View>
                        <Text style={styles.pedidoId}>Pedido #{pedido.id_pedido}</Text>
                        <Text style={styles.pedidoFecha}>
                          {formatearFecha(pedido.fecha_pedido)}
                        </Text>
                      </View>
                      <Text style={styles.pedidoTotal}>S/ {parseFloat(pedido.total).toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Mi Perfil */}
      <Modal visible={showProfileModal} animationType="slide">
        <View style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowProfileModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={32} color="#221329" />
            </TouchableOpacity>
          </View>
          <MyProfile />
        </View>
      </Modal>

      {/* Modal de Mis Direcciones */}
      <Modal visible={showDirectionModal} animationType="slide">
        <View style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDirectionModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={32} color="#221329" />
            </TouchableOpacity>
          </View>
          <MyDirection />
        </View>
      </Modal>

      {/* Modal de Contáctenos */}
      <Modal visible={showContactModal} animationType="slide">
        <View style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowContactModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={32} color="#221329" />
            </TouchableOpacity>
          </View>
          <MyContactenos />
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
  notAuthContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#221329',
    marginTop: 20,
  },
  notAuthText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 40,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#221329',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#221329',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#221329',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
  },
  linkButtonText: {
    color: '#221329',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#221329',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#221329',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  adminItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  adminIcon: {
    backgroundColor: '#4CAF50',
  },
  adminText: {
    color: '#4CAF50',
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutText: {
    color: '#dc3545',
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
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pedidosModal: {
    maxHeight: '80%',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
  },
  pedidosList: {
    maxHeight: 400,
  },
  pedidoCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  pedidoTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pedidoFecha: {
    fontSize: 14,
    color: '#666',
  },
});

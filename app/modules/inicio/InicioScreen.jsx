import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCart } from "@/components/context/carritoContext";
import { useAuth } from "@/components/context/authContext";
import { useSearch } from "../../context/searchContext";
import RecuperarPassword from '../../auth/RecuperarPassword';
import { getProductosDatabase } from "@/components/services/store/productos";

const { width } = Dimensions.get("window");

export default function InicioScreen() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAdminVisible, setModalAdminVisible] = useState(false);
  const [adminUsuario, setAdminUsuario] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const { agregarAlCarrito } = useCart();
  const { isAuthenticated, isAdmin, login } = useAuth();
  const { searchTerm } = useSearch();
  const navigation = useNavigation();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      console.log('🛍️ Cargando productos de la base de datos...');
      const response = await getProductosDatabase();
      
      if (response.success) {
        setProductos(response.productos);
        console.log(`✅ ${response.productos.length} productos cargados de BD`);
      } else {
        console.error('❌ Error en respuesta:', response);
        Alert.alert('Error', 'No se pudieron cargar los productos');
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      Alert.alert('Error', 'Error al cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  // 🔹 Filtrar productos por búsqueda
  const productosFiltrados = searchTerm
    ? productos.filter((p) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      )
    : productos;

  // 🔹 Filtrar los más comprados
  const masComprados = productosFiltrados
    .sort((a, b) => b.rating.count - a.rating.count)
    .slice(0, 6); // top 6

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8A00D4" />
        <Text style={{ marginTop: 10 }}>Cargando productos...</Text>
      </View>
    );
  }

  const handleAgregarCarrito = (producto) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión para agregar productos al carrito',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Perfil') },
        ]
      );
      return;
    }
    agregarAlCarrito(producto);
    Alert.alert('¡Agregado!', 'Producto agregado al carrito');
  };

  const handleAdminAccess = () => {
    console.log('🔘 Click en botón admin');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isAdmin():', isAdmin());
    console.log('modalAdminVisible antes:', modalAdminVisible);
    
    if (isAuthenticated && isAdmin()) {
      // Si ya está autenticado como admin, ir directo al panel
      console.log('➡️ Ya es admin, ir directo al panel');
      navigation.navigate('AdminHome');
    } else {
      // Mostrar modal de login de admin
      console.log('➡️ Mostrar modal de login');
      setModalAdminVisible(true);
      console.log('modalAdminVisible después:', true);
    }
  };

  const handleLoginAdmin = async () => {
    console.log('🔐 Intentando login admin...');
    console.log('Usuario:', adminUsuario);
    console.log('Password length:', adminPassword?.length);
    
    if (!adminUsuario || !adminPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setVerifyingAdmin(true);
      console.log('📡 Llamando a login con:', { usuario: adminUsuario });

      const response = await login(adminUsuario, adminPassword);
      console.log('📥 Respuesta completa de login:', JSON.stringify(response, null, 2));

      if (response && response.success) {
        console.log('✅ Login exitoso');
        console.log('Usuario:', response.user);
        console.log('Rol:', response.user?.rol);
        
        if (response.user && response.user.rol === 'administrador') {
          console.log('✅ Usuario es administrador, cerrando modal...');
          
          // Cerrar modal primero
          setModalAdminVisible(false);
          setAdminUsuario("");
          setAdminPassword("");
          
          console.log('🚀 Navegando a AdminHome...');
          
          // Navegar después de un pequeño delay para asegurar que el modal se cierre
          setTimeout(() => {
            console.log('🎯 Ejecutando navegación...');
            try {
              navigation.navigate('AdminHome');
              console.log('✅ Navegación ejecutada');
            } catch (navError) {
              console.error('❌ Error en navegación:', navError);
              Alert.alert('Error', 'No se pudo navegar al panel de administración');
            }
          }, 300);
        } else {
          console.log('❌ Usuario no es administrador, rol:', response.user?.rol);
          Alert.alert(
            '🚫 Acceso Denegado',
            'No tienes el nivel de administrador necesario para acceder a este panel.\n\nTu rol actual: ' + (response.user?.rol || 'cliente'),
            [{ text: 'Entendido' }]
          );
        }
      } else {
        console.log('❌ Login fallido');
        console.log('Mensaje:', response?.message);
        Alert.alert('Error', response?.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('💥 Error en login admin:', error);
      console.error('Stack:', error.stack);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión: ' + error.message);
    } finally {
      console.log('🏁 Finalizando login, verifyingAdmin = false');
      setVerifyingAdmin(false);
    }
  };

  const handleCancelarModalAdmin = () => {
    setModalAdminVisible(false);
    setAdminUsuario("");
    setAdminPassword("");
    setShowAdminPassword(false);
  };

  // Función temporal para debugging - ELIMINAR EN PRODUCCIÓN
  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('✅ Storage Limpiado', 'Reinicia la app para ver los cambios');
      console.log('🗑️ AsyncStorage limpiado');
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Botón flotante de Admin
        <TouchableOpacity style={styles.adminButton} onPress={handleAdminAccess}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
        </TouchableOpacity> */}

        {/* Botón temporal de debug - ELIMINAR EN PRODUCCIÓN
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={clearAsyncStorage}
        >
          <Text style={styles.debugButtonText}>🗑️ Limpiar Storage (Debug)</Text>
        </TouchableOpacity> */}

      {/* 🔹 Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://picsum.photos/800/300" }}
          style={styles.banner}
        />
        <Text style={styles.bannerText}>¡Bienvenido a nuestra tienda!</Text>
      </View>

      {/* 🔹 Sección de productos más comprados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Los más comprados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {masComprados.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>S/ {item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  handleAgregarCarrito({
                    id: item.id,
                    nombre: item.title,
                    precio: item.price,
                    imagen: item.image,
                  })
                }
              >
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 🔹 Sección de todos los productos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos los productos'}
        </Text>
        {productosFiltrados.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron productos</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {productosFiltrados.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>S/ {item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  handleAgregarCarrito({
                    id: item.id,
                    nombre: item.title,
                    precio: item.price,
                    imagen: item.image,
                  })
                }
              >
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          ))}
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal de Login Admin - FUERA del ScrollView */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAdminVisible}
        onRequestClose={handleCancelarModalAdmin}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={50} color="#221329" />
              <Text style={styles.modalTitle}>Acceso Administrador</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tus credenciales de administrador
              </Text>
            </View>

            <View style={styles.modalBody}>
              {/* Campo de Usuario */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Usuario"
                  placeholderTextColor="#999"
                  value={adminUsuario}
                  onChangeText={setAdminUsuario}
                  autoCapitalize="none"
                  autoFocus={true}
                />
              </View>

              {/* Campo de Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                  secureTextEntry={!showAdminPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowAdminPassword(!showAdminPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showAdminPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelarModalAdmin}
                  disabled={verifyingAdmin}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, verifyingAdmin && styles.buttonDisabled]}
                  onPress={handleLoginAdmin}
                  disabled={verifyingAdmin}
                >
                  {verifyingAdmin ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="log-in" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>Ingresar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Botón de Recuperar Contraseña */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  setModalAdminVisible(false);
                  setShowRecoveryModal(true);
                }}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <View style={styles.adminHint}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.hintText}>
                  Credenciales por defecto: admin / admin123
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Recuperar Contraseña */}
      <Modal
        visible={showRecoveryModal}
        animationType="slide"
        onRequestClose={() => setShowRecoveryModal(false)}
      >
        <View style={styles.recoveryModalContainer}>
          <View style={styles.recoveryModalHeader}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerContainer: { position: "relative", marginBottom: 15 },
  banner: { width: "100%", height: 180, borderRadius: 12, resizeMode: "cover" },
  bannerText: {
    position: "absolute",
    bottom: 10,
    left: 15,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  section: { paddingHorizontal: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    width: (width - 45) / 2, // Calcula el ancho para 2 columnas con padding
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 120, borderRadius: 10, resizeMode: "contain" },
  cardTitle: { fontSize: 13, fontWeight: "600", marginTop: 5 },
  cardPrice: { fontSize: 14, fontWeight: "bold", color: "#8A00D4", marginVertical: 5 },
  button: { backgroundColor: "#8A00D4", borderRadius: 8, paddingVertical: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  adminButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#221329',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height : 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  // Estilos del Modal Admin
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#221329',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#221329',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#221329',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#221329',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  adminHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
    padding: 8,
  },
  forgotPasswordText: {
    color: '#221329',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Botón de debug - TEMPORAL
  debugButton: {
    position: 'absolute',
    top: 130,
    right: 20,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 10,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  recoveryModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recoveryModalHeader: {
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
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});

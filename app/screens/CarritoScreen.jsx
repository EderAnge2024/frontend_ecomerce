import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, SafeAreaView, ScrollView, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useCart } from "@/components/context/carritoContext";
import { useAuth } from "@/components/context/authContext";
import { useRouter } from "expo-router";
import { loginUser } from "@/components/services/store/users";
import { getUbicacionesByUser } from "@/components/services/store/ubicaciones";


export default function CarritoScreen() {
  const { carrito, eliminarDelCarrito, incrementarCantidad, decrementarCantidad, limpiarCarrito, finalizarCompraMultiVendedor, previewDivision, calcularTotal, cantidadProductos } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Estados para ubicaciones
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);



  // Cargar ubicaciones del usuario
  useEffect(() => {
    if (isAuthenticated && user?.id_usuario) {
      cargarUbicaciones();
    }
  }, [isAuthenticated, user]);

  const cargarUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const response = await getUbicacionesByUser(user.id_usuario);
      if (response.success) {
        setUbicaciones(response.ubicaciones || []);
        // Seleccionar la principal por defecto
        const principal = response.ubicaciones?.find(u => u.es_principal);
        if (principal) {
          setUbicacionSeleccionada(principal.id_ubicacion);
        } else if (response.ubicaciones?.length > 0) {
          // Si no hay principal, seleccionar la primera
          setUbicacionSeleccionada(response.ubicaciones[0].id_ubicacion);
        }
      }
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const handleFinalizarCompra = async () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito Vacío', 'Agrega productos al carrito antes de finalizar la compra');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión o registrarte para realizar una compra',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Registrarse', onPress: () => router.push('/auth/Register') },
          { text: 'Iniciar Sesión', onPress: () => router.push('/auth/Login') },
        ]
      );
      return;
    }

    // Verificar que haya ubicaciones
    if (ubicaciones.length === 0) {
      Alert.alert(
        'Sin Dirección de Envío',
        'Debes agregar una dirección de envío antes de realizar una compra',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Agregar Dirección', onPress: () => router.push('/modules/perfil/perfil') },
        ]
      );
      return;
    }

    // Verificar que haya una ubicación seleccionada
    if (!ubicacionSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona una dirección de envío');
      return;
    }

    // Mostrar modal de confirmación con contraseña
    setModalVisible(true);
  };

  const handleConfirmarConPassword = async () => {
    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    try {
      setVerifying(true);

      // Verificar la contraseña del usuario
      const response = await loginUser(user.usuario, password);

      if (!response.success) {
        Alert.alert('Error', 'Contraseña incorrecta');
        setVerifying(false);
        return;
      }

      // Si la contraseña es correcta, procesar el pedido
      setModalVisible(false);
      setPassword("");
      setLoading(true);

      console.log('🛒 Enviando pedido multi-vendedor con ubicación:', ubicacionSeleccionada);
      const pedidoResponse = await finalizarCompraMultiVendedor(user.id_usuario, ubicacionSeleccionada);

      if (pedidoResponse.success) {
        Alert.alert(
          '¡Pedido Exitoso!',
          'Tu pedido ha sido registrado correctamente. Recibirás una confirmación pronto.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', pedidoResponse.message || 'No se pudo procesar el pedido');
      }
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar tu pedido');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleCancelarModal = () => {
    setModalVisible(false);
    setPassword("");
    setShowPassword(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {carrito.length === 0 ? (
        <>
          <View style={styles.header}>
            <Ionicons name="cart" size={32} color="#221329" />
            <Text style={styles.headerTitle}>Mi Carrito</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={100} color="#ccc" />
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtext}>Agrega productos para comenzar</Text>
          </View>
        </>
      ) : (
        <>
          {/* Header fijo */}
          <View style={styles.header}>
            <Ionicons name="cart" size={32} color="#221329" />
            <Text style={styles.headerTitle}>Mi Carrito</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cantidadProductos()}</Text>
            </View>
          </View>

          {/* ScrollView con productos */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
          >
            {carrito.map((item) => (
              <View key={item.id.toString()} style={styles.item}>
                {/* Imagen del producto */}
                {item.imagen && item.imagen.trim() !== '' && (
                  <Image 
                    source={{ uri: item.imagen || 'https://via.placeholder.com/50x60?text=No+Image' }}
                    style={{
                      width: 50,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 12,
                      backgroundColor: '#f9f9f9',
                    }}
                    resizeMode="contain"
                    onError={() => console.log('Error loading image:', item.imagen)}
                  />
                )}
                
                <View style={styles.itemInfo}>
                  <Text style={styles.name} numberOfLines={2}>{item.nombre}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>S/ {item.precio.toFixed(2)}</Text>
                    <Text style={styles.cantidad}>x {item.cantidad || 1}</Text>
                  </View>
                  <Text style={styles.subtotal}>
                    Subtotal: S/ {(item.precio * (item.cantidad || 1)).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarDelCarrito(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Selector de Ubicación - Reorganizado */}
          {isAuthenticated && (
            <View style={styles.ubicacionContainer}>
              {loadingUbicaciones ? (
                <View style={styles.ubicacionHeader}>
                  <Ionicons name="location" size={18} color="#221329" />
                  <Text style={styles.ubicacionTitle}>Cargando direcciones...</Text>
                  <ActivityIndicator size="small" color="#221329" style={{marginLeft: 8}} />
                </View>
              ) : ubicaciones.length === 0 ? (
                <TouchableOpacity 
                  style={styles.agregarUbicacionButtonCompact}
                  onPress={() => router.push('/modules/perfil/perfil')}
                >
                  <Ionicons name="location" size={18} color="#221329" />
                  <Text style={styles.ubicacionTitleCompact}>Agregar dirección de envío</Text>
                  <Ionicons name="add-circle-outline" size={18} color="#221329" />
                </TouchableOpacity>
              ) : (
                <View style={styles.envioRowContainer}>
                  <View style={styles.envioLabelContainer}>
                    <Ionicons name="location" size={18} color="#221329" />
                    <Text style={styles.envioLabel}>Envío a:</Text>
                  </View>
                  
                  <View style={styles.envioUbicacionContainer}>
                    {ubicaciones.find(u => u.id_ubicacion === ubicacionSeleccionada) ? (
                      <TouchableOpacity 
                        style={styles.ubicacionSeleccionadaDisplay}
                        onPress={() => {
                          // Aquí podrías abrir un modal para cambiar ubicación si quieres
                        }}
                      >
                        <Text style={styles.ubicacionSeleccionadaNombre}>
                          {ubicaciones.find(u => u.id_ubicacion === ubicacionSeleccionada)?.nombre}
                        </Text>
                        <Text style={styles.ubicacionSeleccionadaDireccion} numberOfLines={1}>
                          {ubicaciones.find(u => u.id_ubicacion === ubicacionSeleccionada)?.direccion}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.sinUbicacionText}>Seleccionar ubicación</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>S/ {calcularTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={limpiarCarrito}
                disabled={loading}
              >
                <Ionicons name="trash" size={18} color="#fff" />
                <Text style={styles.clearText}>Vaciar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.checkoutButton, loading && styles.buttonDisabled]} 
                onPress={handleFinalizarCompra}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.checkoutText}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Modal de Confirmación con Contraseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelarModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelarModal}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={40} color="#221329" />
              <Text style={styles.modalTitle}>Confirmar Pedido</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tu contraseña para confirmar la compra
              </Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Lista de productos en el modal */}
              <View style={styles.productosModalContainer}>
                <Text style={styles.productosModalTitle}>Productos a comprar:</Text>
                {carrito.map((item) => (
                  <View key={item.id.toString()} style={styles.productoModalItem}>
                    {item.imagen && item.imagen.trim() !== '' && (
                      <Image 
                        source={{ uri: item.imagen || 'https://via.placeholder.com/40x40?text=No+Image' }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          marginRight: 10,
                          backgroundColor: '#f9f9f9',
                        }}
                        resizeMode="contain"
                        onError={() => console.log('Error loading modal image:', item.imagen)}
                      />
                    )}
                    <View style={styles.productoModalInfo}>
                      <Text style={styles.productoModalNombre} numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.productoModalPrecio}>
                        S/ {item.precio.toFixed(2)} c/u
                      </Text>
                    </View>
                    
                    {/* Controles de cantidad */}
                    <View style={styles.cantidadControls}>
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => decrementarCantidad(item.id)}
                        disabled={verifying}
                      >
                        <Ionicons name="remove" size={16} color="#221329" />
                      </TouchableOpacity>
                      
                      <Text style={styles.cantidadText}>
                        {item.cantidad || 1}
                      </Text>
                      
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => incrementarCantidad(item.id)}
                        disabled={verifying}
                      >
                        <Ionicons name="add" size={16} color="#221329" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.productoModalSubtotal}>
                      S/ {(item.precio * (item.cantidad || 1)).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.summaryLabel}>Total a pagar:</Text>
                <Text style={styles.summaryAmount}>S/ {calcularTotal().toFixed(2)}</Text>
              </View>

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
                  autoFocus={true}
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelarModal}
                  disabled={verifying}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, verifying && styles.buttonDisabled]}
                  onPress={handleConfirmarConPassword}
                  disabled={verifying}
                >
                  {verifying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#221329',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    backgroundColor: '#221329',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 7,
    paddingTop: 1,
    paddingBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 12,
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: "#221329",
    marginBottom: 8,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 11,
    color: "#666",
    marginRight: 8,
  },
  cantidad: {
    fontSize: 13,
    color: "#666",
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subtotal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  footerSpacer: {
    height: 16,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#221329',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  clearText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  checkoutButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#221329",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: "#666",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  // Estilos del Modal
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
    maxHeight: 400,
    padding: 24,
  },
  productosModalContainer: {
    marginBottom: 16,
  },
  productosModalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 12,
  },
  productoModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  productoModalInfo: {
    flex: 1,
    marginRight: 8,
  },
  productoModalNombre: {
    fontSize: 13,
    fontWeight: '500',
    color: '#221329',
    marginBottom: 2,
  },
  productoModalPrecio: {
    fontSize: 11,
    color: '#666',
  },
  productoModalSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 60,
    textAlign: 'right',
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  cantidadButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cantidadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    minWidth: 30,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  orderSummary: {
    backgroundColor: '#221329',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
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
  ubicacionContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ubicacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ubicacionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221329',
  },
  ubicacionesScroll: {
    flexDirection: 'row',
  },
  ubicacionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  ubicacionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff4',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  ubicacionNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  ubicacionDireccion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ubicacionCiudad: {
    fontSize: 11,
    color: '#999',
  },
  agregarUbicacionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  agregarUbicacionText: {
    fontSize: 14,
    color: '#221329',
    fontWeight: '500',
  },
  // Estilos compactos para la sección reorganizada
  ubicacionHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ubicacionTitleCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  agregarUbicacionButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ubicacionesScrollCompact: {
    flexDirection: 'row',
  },
  ubicacionCardCompact: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    minWidth: 140,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  ubicacionCardSelectedCompact: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff4',
  },
  checkIconCompact: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  ubicacionNombreCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 2,
  },
  ubicacionDireccionCompact: {
    fontSize: 10,
    color: '#666',
  },
  // Estilos para layout horizontal "Envío a:"
  envioRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  envioLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  envioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  envioUbicacionContainer: {
    flex: 1,
    marginLeft: 12,
  },
  ubicacionSeleccionadaDisplay: {
    flexDirection: 'colunm',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 8,
  },
  ubicacionSeleccionadaNombre: {
    fontSize: 12,
    fontWeight: '600',
    color: '#221329',
  },
  ubicacionSeleccionadaDireccion: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  sinUbicacionText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

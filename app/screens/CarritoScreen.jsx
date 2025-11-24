import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, SafeAreaView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useCart } from "@/components/context/carritoContext";
import { useAuth } from "@/components/context/authContext";
import { useRouter } from "expo-router";
import { loginUser } from "@/components/services/store/users";

export default function CarritoScreen() {
  const { carrito, eliminarDelCarrito, limpiarCarrito, finalizarCompra, calcularTotal, cantidadProductos } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);



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

      const pedidoResponse = await finalizarCompra(user.id_usuario);

      if (pedidoResponse.success) {
        Alert.alert(
          '¡Pedido Exitoso!',
          'Tu pedido ha sido registrado correctamente. El administrador lo procesará pronto.',
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
          <FlatList
            data={carrito}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              <View style={styles.header}>
                <Ionicons name="cart" size={32} color="#221329" />
                <Text style={styles.headerTitle}>Mi Carrito</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cantidadProductos()}</Text>
                </View>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerSpacer} />
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.name} numberOfLines={2}>{item.nombre}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>S/ {item.precio.toFixed(2)}</Text>
                    <Text style={styles.cantidad}>x {item.cantidad || 1}</Text>
                  </View>
                  <Text style={styles.subtotal}>
                    S/ {(item.precio * (item.cantidad || 1)).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarDelCarrito(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={40} color="#221329" />
              <Text style={styles.modalTitle}>Confirmar Pedido</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tu contraseña para confirmar la compra
              </Text>
            </View>

            <View style={styles.modalBody}>
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
            </View>
          </View>
        </View>
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
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  item: {
    flexDirection: "row",
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: "#221329",
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  cantidad: {
    fontSize: 14,
    color: "#666",
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subtotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#221329",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  footerSpacer: {
    height: 16,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
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
    padding: 24,
  },
  orderSummary: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#221329',
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
});

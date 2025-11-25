import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CarritoScreen from '../screens/CarritoScreen';
import { useSearch } from '../context/searchContext';

const Header = () => {
  // Texto local del input de búsqueda
  const [searchText, setSearchText] = useState('');
  
  // Controla visibilidad del modal del carrito
  const [modalVisible, setModalVisible] = useState(false);
  
  // Funciones del contexto de búsqueda global
  const { updateSearch, clearSearch } = useSearch();

  // Actualizar búsqueda local y global
  const handleSearch = (text) => {
    setSearchText(text);
    updateSearch(text);
  };

  // Limpiar búsqueda local y global
  const handleClearSearch = () => {
    setSearchText('');
    clearSearch();
  };

  // Abrir modal del carrito
  const openCart = () => setModalVisible(true);
  
  // Cerrar modal del carrito
  const closeCart = () => setModalVisible(false);

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.cartButton} onPress={openCart} activeOpacity={0.7}>
          <Ionicons name="cart" size={28} color="#221329ff" />
        </TouchableOpacity>
      </View>

      {/* Modal flotante */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCart}
      >
        <Pressable style={styles.overlay} onPress={closeCart}>
          <View style={styles.modalContainer}>
            <CarritoScreen closeModal={closeCart} />  
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  clearButton: { padding: 4 },
  cartButton: { padding: 8 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start', // se abre desde arriba
    alignItems: 'flex-end', // ajusta a la derecha
    paddingTop: 60,
    paddingRight: 16,
  },
  modalContainer: {
    width: 300,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default Header;

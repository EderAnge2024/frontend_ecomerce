import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/components/context/carritoContext';
//import { API_PRODUCTOS } from '@env';
const API_PRODUCTOS='https://fakestoreapi.com'

// Componente para el botón del dropdown
const DropdownButton = ({ categoriaSeleccionada, onPress, isVisible }) => (
  <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
    <Text style={styles.dropdownText}>
      {categoriaSeleccionada === 'all'
        ? 'Todas las categorías'
        : categoriaSeleccionada.charAt(0).toUpperCase() +
          categoriaSeleccionada.slice(1)}
    </Text>
    <Ionicons
      name={isVisible ? 'chevron-up' : 'chevron-down'}
      size={20}
      color="#8A00D4"
    />
  </TouchableOpacity>
);

// Componente para ítem de categoría
const CategoriaItem = ({ categoria, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.dropdownItemText,
        isActive && styles.dropdownItemTextActive,
      ]}
    >
      {categoria === 'all'
        ? 'Todas las categorías'
        : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
    </Text>
  </TouchableOpacity>
);

// Tarjeta de producto
const ProductoCard = ({ item, onAgregar }) => (
  <View style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <View style={styles.info}>
      <Text numberOfLines={2} style={styles.title}>
        {item.title}
      </Text>
      <Text style={styles.category}>{item.category.toUpperCase()}</Text>
      <Text style={styles.price}>S/ {item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          onAgregar({
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
  </View>
);

// Componente principal
export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { agregarAlCarrito } = useCart();

  // Cargar productos
  useEffect(() => {
    fetch(`${API_PRODUCTOS}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // Cargar categorías
  useEffect(() => {
    fetch(`${API_PRODUCTOS}/products/categories`)
      .then((res) => res.json())
      .then((data) => setCategorias(['all', ...data]));
  }, []);

  // Filtrar productos
  const productosFiltrados =
    categoriaSeleccionada === 'all'
      ? productos
      : productos.filter((p) => p.category === categoriaSeleccionada);

  // Manejar selección de categoría
  const handleCategoriaSelect = (cat) => {
    setCategoriaSeleccionada(cat);
    setDropdownVisible(false);
  };

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8A00D4" />
        <Text style={{ marginTop: 10, color: '#555' }}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtro por categoría */}
      <View style={styles.filterContainer}>
        <DropdownButton
          categoriaSeleccionada={categoriaSeleccionada}
          onPress={() => setDropdownVisible(!dropdownVisible)}
          isVisible={dropdownVisible}
        />

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            <ScrollView>
              {categorias.map((cat) => (
                <CategoriaItem
                  key={cat}
                  categoria={cat}
                  isActive={categoriaSeleccionada === cat}
                  onPress={() => handleCategoriaSelect(cat)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductoCard item={item} onAgregar={agregarAlCarrito} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

// Estilos tipo Ripley
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 10,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
  },
  dropdownText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: '#fff',
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#f3e8ff',
  },
  dropdownItemText: {
    color: '#444',
  },
  dropdownItemTextActive: {
    color: '#8A00D4',
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-around',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 130,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  info: {
    marginTop: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },
  category: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    color: '#8A00D4',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#8A00D4',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
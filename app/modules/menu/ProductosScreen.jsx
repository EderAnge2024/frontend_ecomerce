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
import { useSearch } from '../../context/searchContext';
import { getProductosDatabase } from '@/components/services/store/productos';

// Componente para card de categoría
const CategoriaCard = ({ categoria, isActive, onPress }) => {
  // Función para obtener icono dinámico basado en el nombre de la categoría
  const getIconoCategoria = (categoria) => {
    if (categoria === 'all') return 'grid-outline';
    
    const categoriaLower = categoria.toLowerCase();
    
    // Mapeo bilingüe de palabras clave a iconos (Español e Inglés)
    const mapeoIconos = {
      // Electrónicos y tecnología
      'electronic': 'phone-portrait-outline',
      'electronico': 'phone-portrait-outline',
      'electrónico': 'phone-portrait-outline',
      'tecnologia': 'hardware-chip-outline',
      'tecnología': 'hardware-chip-outline',
      'technology': 'hardware-chip-outline',
      'phone': 'phone-portrait-outline',
      'telefono': 'phone-portrait-outline',
      'teléfono': 'phone-portrait-outline',
      'celular': 'phone-portrait-outline',
      'movil': 'phone-portrait-outline',
      'móvil': 'phone-portrait-outline',
      'computer': 'laptop-outline',
      'computadora': 'laptop-outline',
      'ordenador': 'laptop-outline',
      'laptop': 'laptop-outline',
      'tablet': 'tablet-portrait-outline',
      'tableta': 'tablet-portrait-outline',
      'camera': 'camera-outline',
      'camara': 'camera-outline',
      'cámara': 'camera-outline',
      'headphone': 'headset-outline',
      'audifono': 'headset-outline',
      'audífono': 'headset-outline',
      'auricular': 'headset-outline',
      'audio': 'headset-outline',
      'gaming': 'game-controller-outline',
      'juego': 'game-controller-outline',
      'videojuego': 'game-controller-outline',
      'tech': 'hardware-chip-outline',
      
      // Ropa y moda
      'clothing': 'shirt-outline',
      'ropa': 'shirt-outline',
      'vestimenta': 'shirt-outline',
      'prenda': 'shirt-outline',
      'shirt': 'shirt-outline',
      'camisa': 'shirt-outline',
      'playera': 'shirt-outline',
      'camiseta': 'shirt-outline',
      'dress': 'woman-outline',
      'vestido': 'woman-outline',
      'pants': 'shirt-outline',
      'pantalon': 'shirt-outline',
      'pantalón': 'shirt-outline',
      'jean': 'shirt-outline',
      'vaquero': 'shirt-outline',
      'shoe': 'footsteps-outline',
      'zapato': 'footsteps-outline',
      'calzado': 'footsteps-outline',
      'boot': 'footsteps-outline',
      'bota': 'footsteps-outline',
      'sneaker': 'footsteps-outline',
      'tenis': 'footsteps-outline',
      'zapatilla': 'footsteps-outline',
      'deportivo': 'footsteps-outline',
      'fashion': 'shirt-outline',
      'moda': 'shirt-outline',
      'apparel': 'shirt-outline',
      'men': 'man-outline',
      'hombre': 'man-outline',
      'masculino': 'man-outline',
      'caballero': 'man-outline',
      'women': 'woman-outline',
      'mujer': 'woman-outline',
      'femenino': 'woman-outline',
      'dama': 'woman-outline',
      'kid': 'happy-outline',
      'niño': 'happy-outline',
      'niña': 'happy-outline',
      'infantil': 'happy-outline',
      'baby': 'happy-outline',
      'bebe': 'happy-outline',
      'bebé': 'happy-outline',
      
      // Joyería y accesorios
      'jewelry': 'diamond-outline',
      'jewelery': 'diamond-outline',
      'joyeria': 'diamond-outline',
      'joyería': 'diamond-outline',
      'bisuteria': 'diamond-outline',
      'bisutería': 'diamond-outline',
      'watch': 'time-outline',
      'reloj': 'time-outline',
      'ring': 'diamond-outline',
      'anillo': 'diamond-outline',
      'sortija': 'diamond-outline',
      'necklace': 'diamond-outline',
      'collar': 'diamond-outline',
      'cadena': 'diamond-outline',
      'bracelet': 'diamond-outline',
      'pulsera': 'diamond-outline',
      'brazalete': 'diamond-outline',
      'accessory': 'diamond-outline',
      'accesorio': 'diamond-outline',
      
      // Hogar y jardín
      'home': 'home-outline',
      'hogar': 'home-outline',
      'casa': 'home-outline',
      'house': 'home-outline',
      'furniture': 'bed-outline',
      'mueble': 'bed-outline',
      'mobiliario': 'bed-outline',
      'kitchen': 'restaurant-outline',
      'cocina': 'restaurant-outline',
      'garden': 'leaf-outline',
      'jardin': 'leaf-outline',
      'jardín': 'leaf-outline',
      'planta': 'leaf-outline',
      'decor': 'home-outline',
      'decoracion': 'home-outline',
      'decoración': 'home-outline',
      'adorno': 'home-outline',
      'appliance': 'home-outline',
      'electrodomestico': 'home-outline',
      'electrodoméstico': 'home-outline',
      
      // Deportes y fitness
      'sport': 'fitness-outline',
      'deporte': 'fitness-outline',
      'deportivo': 'fitness-outline',
      'fitness': 'fitness-outline',
      'ejercicio': 'fitness-outline',
      'gym': 'barbell-outline',
      'gimnasio': 'barbell-outline',
      'exercise': 'fitness-outline',
      'entrenamiento': 'fitness-outline',
      'outdoor': 'trail-sign-outline',
      'aire libre': 'trail-sign-outline',
      'exterior': 'trail-sign-outline',
      'bike': 'bicycle-outline',
      'bicicleta': 'bicycle-outline',
      'cicla': 'bicycle-outline',
      'soccer': 'football-outline',
      'futbol': 'football-outline',
      'fútbol': 'football-outline',
      'basketball': 'basketball-outline',
      'basquet': 'basketball-outline',
      'baloncesto': 'basketball-outline',
      
      // Salud y belleza
      'beauty': 'rose-outline',
      'belleza': 'rose-outline',
      'cosmetic': 'rose-outline',
      'cosmetico': 'rose-outline',
      'cosmético': 'rose-outline',
      'maquillaje': 'rose-outline',
      'health': 'medical-outline',
      'salud': 'medical-outline',
      'medicina': 'medical-outline',
      'farmacia': 'medical-outline',
      'skincare': 'rose-outline',
      'cuidado': 'rose-outline',
      'piel': 'rose-outline',
      'makeup': 'rose-outline',
      'perfume': 'rose-outline',
      'fragancia': 'rose-outline',
      'colonia': 'rose-outline',
      
      // Libros y educación
      'book': 'book-outline',
      'libro': 'book-outline',
      'lectura': 'book-outline',
      'education': 'school-outline',
      'educacion': 'school-outline',
      'educación': 'school-outline',
      'escuela': 'school-outline',
      'estudio': 'library-outline',
      'study': 'library-outline',
      'magazine': 'newspaper-outline',
      'revista': 'newspaper-outline',
      'periodico': 'newspaper-outline',
      'periódico': 'newspaper-outline',
      
      // Comida y bebidas
      'food': 'restaurant-outline',
      'comida': 'restaurant-outline',
      'alimento': 'restaurant-outline',
      'alimentacion': 'restaurant-outline',
      'alimentación': 'restaurant-outline',
      'drink': 'wine-outline',
      'bebida': 'wine-outline',
      'liquido': 'wine-outline',
      'líquido': 'wine-outline',
      'coffee': 'cafe-outline',
      'cafe': 'cafe-outline',
      'café': 'cafe-outline',
      'snack': 'fast-food-outline',
      'bocadillo': 'fast-food-outline',
      'merienda': 'fast-food-outline',
      'grocery': 'basket-outline',
      'supermercado': 'basket-outline',
      'mercado': 'basket-outline',
      'despensa': 'basket-outline',
      
      // Juguetes y entretenimiento
      'toy': 'game-controller-outline',
      'juguete': 'game-controller-outline',
      'game': 'game-controller-outline',
      'juego': 'game-controller-outline',
      'puzzle': 'extension-puzzle-outline',
      'rompecabeza': 'extension-puzzle-outline',
      'rompecabezas': 'extension-puzzle-outline',
      'entertainment': 'tv-outline',
      'entretenimiento': 'tv-outline',
      'diversion': 'tv-outline',
      'diversión': 'tv-outline',
      'music': 'musical-notes-outline',
      'musica': 'musical-notes-outline',
      'música': 'musical-notes-outline',
      'movie': 'film-outline',
      'pelicula': 'film-outline',
      'película': 'film-outline',
      'cine': 'film-outline',
      
      // Automóviles y transporte
      'car': 'car-outline',
      'carro': 'car-outline',
      'auto': 'car-outline',
      'automovil': 'car-outline',
      'automóvil': 'car-outline',
      'vehiculo': 'car-outline',
      'vehículo': 'car-outline',
      'motorcycle': 'bicycle-outline',
      'motocicleta': 'bicycle-outline',
      'moto': 'bicycle-outline',
      'transport': 'car-outline',
      'transporte': 'car-outline',
      
      // Mascotas
      'pet': 'paw-outline',
      'mascota': 'paw-outline',
      'animal': 'paw-outline',
      'dog': 'paw-outline',
      'perro': 'paw-outline',
      'can': 'paw-outline',
      'cat': 'paw-outline',
      'gato': 'paw-outline',
      'felino': 'paw-outline',
      
      // Oficina y papelería
      'office': 'briefcase-outline',
      'oficina': 'briefcase-outline',
      'trabajo': 'briefcase-outline',
      'stationery': 'pencil-outline',
      'papeleria': 'pencil-outline',
      'papelería': 'pencil-outline',
      'escolar': 'pencil-outline',
      'paper': 'document-outline',
      'papel': 'document-outline',
      'documento': 'document-outline',
      'pen': 'pencil-outline',
      'lapiz': 'pencil-outline',
      'lápiz': 'pencil-outline',
      'boligrafo': 'pencil-outline',
      'bolígrafo': 'pencil-outline',
      'pluma': 'pencil-outline',
      
      // Arte y manualidades
      'art': 'brush-outline',
      'arte': 'brush-outline',
      'artistico': 'brush-outline',
      'artístico': 'brush-outline',
      'craft': 'brush-outline',
      'manualidad': 'brush-outline',
      'artesania': 'brush-outline',
      'artesanía': 'brush-outline',
      'paint': 'brush-outline',
      'pintura': 'brush-outline',
      'pintar': 'brush-outline',
      'creative': 'brush-outline',
      'creativo': 'brush-outline',
      'creatividad': 'brush-outline',
    };
    
    // Buscar coincidencias en el nombre de la categoría
    for (const [palabra, icono] of Object.entries(mapeoIconos)) {
      if (categoriaLower.includes(palabra)) {
        return icono;
      }
    }
    
    // Icono por defecto si no se encuentra coincidencia
    return 'pricetag-outline';
  };

  const iconoCategoria = getIconoCategoria(categoria);

  return (
    <TouchableOpacity
      style={[styles.categoriaCard, isActive && styles.categoriaCardActive]}
      onPress={onPress}
    >
      <Ionicons
        name={iconoCategoria}
        size={28}
        color={isActive ? '#fff' : '#8A00D4'}
      />
      <Text
        style={[
          styles.categoriaCardText,
          isActive && styles.categoriaCardTextActive,
        ]}
      >
        {categoria === 'all'
          ? 'Todas'
          : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

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
  const { agregarAlCarrito } = useCart();
  const { searchTerm } = useSearch();

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await getProductosDatabase();
      
      if (response.success) {
        setProductos(response.productos);
        
        // Extraer categorías únicas de los productos
        const categoriasUnicas = [...new Set(response.productos.map(p => p.category))];
        setCategorias(['all', ...categoriasUnicas]);
        
        console.log(`✅ Productos cargados en menú: ${response.productos.length}`);
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar productos por categoría
  let productosFiltrados =
    categoriaSeleccionada === 'all'
      ? productos
      : productos.filter((p) => p.category === categoriaSeleccionada);

  // Filtrar por búsqueda
  if (searchTerm) {
    productosFiltrados = productosFiltrados.filter((p) =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Manejar selección de categoría
  const handleCategoriaSelect = (cat) => {
    setCategoriaSeleccionada(cat);
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
      {/* Cards de categorías */}
      <View style={styles.categoriasContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasScroll}
        >
          {categorias.map((cat) => (
            <CategoriaCard
              key={cat}
              categoria={cat}
              isActive={categoriaSeleccionada === cat}
              onPress={() => handleCategoriaSelect(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="search-outline" size={60} color="#ccc" />
          <Text style={styles.noResultsText}>
            {searchTerm 
              ? `No se encontraron productos para "${searchTerm}"`
              : 'No hay productos en esta categoría'}
          </Text>
        </View>
      ) : (
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
      )}
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
  categoriasContainer: {
    marginBottom: 15,
  },
  categoriasScroll: {
    paddingHorizontal: 15,
    gap: 10,
  },
  categoriaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: '#8A00D4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  categoriaCardActive: {
    backgroundColor: '#8A00D4',
    borderColor: '#8A00D4',
  },
  categoriaCardText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A00D4',
    textAlign: 'center',
  },
  categoriaCardTextActive: {
    color: '#fff',
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
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
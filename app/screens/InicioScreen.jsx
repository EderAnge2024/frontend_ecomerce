import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useCart } from "@/components/context/carritoContext";
//import { API_PRODUCTOS } from "@env";
const API_PRODUCTOS='https://fakestoreapi.com'
const { width } = Dimensions.get("window");

export default function InicioScreen() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { agregarAlCarrito } = useCart();

  useEffect(() => {
    fetch(`${API_PRODUCTOS}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // 🔹 Filtrar los más comprados
  const masComprados = productos
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

  return (
    <ScrollView style={styles.container}>
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
                  agregarAlCarrito({
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
        <Text style={styles.sectionTitle}>Todos los productos</Text>
        <View style={styles.productsGrid}>
          {productos.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>S/ {item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  agregarAlCarrito({
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
      </View>

      <View style={{ height: 30 }} /> {/* espacio final */}
    </ScrollView>
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
    width: width * 0.45,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
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
});
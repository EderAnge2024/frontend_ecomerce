import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useCart } from "@/components/context/carritoContext"; // 🔹 Asegúrate que la ruta sea correcta

export default function CarritoScreen() {
  const { carrito, eliminarDelCarrito, limpiarCarrito } = useCart();

  return (
    <View style={styles.container}>
      {carrito.length === 0 ? (
        <Text style={styles.emptyText}>🛒 El carrito está vacío</Text>
      ) : (
        <>
          <FlatList
            data={carrito}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View>
                  <Text style={styles.name}>{item.nombre}</Text>
                  <Text style={styles.price}>S/ {item.precio.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarDelCarrito(item.id)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity style={styles.clearButton} onPress={limpiarCarrito}>
            <Text style={styles.clearText}>Vaciar carrito</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  name: {
    fontSize: 16,
    color: "#333",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#071e85",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  clearButton: {
    marginTop: 15,
    backgroundColor: "#071e85",
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
    color: "#666",
  },
});

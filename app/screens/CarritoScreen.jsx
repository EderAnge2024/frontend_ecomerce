import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CarritoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito de Compras</Text>
      <Text style={styles.subtitle}>Tus productos seleccionados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

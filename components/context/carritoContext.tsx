import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
}

interface CartContextProps {
  carrito: Producto[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (id: number) => void;
  limpiarCarrito: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<Producto[]>([]);

  // 🔹 Cargar carrito desde AsyncStorage al iniciar
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@carrito");
        if (jsonValue) setCarrito(JSON.parse(jsonValue));
      } catch (e) {
        console.error("Error al cargar carrito:", e);
      }
    };
    cargarCarrito();
  }, []);

  // 🔹 Guardar carrito en AsyncStorage cada vez que cambia
  useEffect(() => {
    const guardarCarrito = async () => {
      try {
        await AsyncStorage.setItem("@carrito", JSON.stringify(carrito));
      } catch (e) {
        console.error("Error al guardar carrito:", e);
      }
    };
    guardarCarrito();
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => [...prev, producto]);
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const limpiarCarrito = () => setCarrito([]);

  return (
    <CartContext.Provider
      value={{ carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

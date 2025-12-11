import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createPedido, createPedidoProducto } from "../services/store/pedidos";
import { procesarCompraMultiVendedor } from "../services/store/pedidos-multi-vendor";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad?: number;
}

interface CartContextProps {
  carrito: Producto[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (id: number) => void;
  incrementarCantidad: (id: number) => void;
  decrementarCantidad: (id: number) => void;
  limpiarCarrito: () => void;
  finalizarCompra: (id_usuario: number, id_ubicacion?: number) => Promise<{ success: boolean; message: string; pedido?: any }>;
  finalizarCompraMultiVendedor: (id_usuario: number, id_ubicacion?: number) => Promise<{ success: boolean; message: string; resultado?: any }>;
  calcularTotal: () => number;
  cantidadProductos: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Lista de productos en el carrito
  const [carrito, setCarrito] = useState<Producto[]>([]);

  // Cargar carrito desde AsyncStorage al iniciar la app
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

  // Guardar carrito en AsyncStorage cada vez que cambia
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

  // Agregar producto al carrito (o incrementar cantidad si ya existe)
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      // Buscar si el producto ya está en el carrito
      const existente = prev.find((p) => p.id === producto.id);
      if (existente) {
        // Incrementar cantidad del producto existente
        return prev.map((p) =>
          p.id === producto.id
            ? { ...p, cantidad: (p.cantidad || 1) + 1 }
            : p
        );
      }
      // Si no existe, agregarlo con cantidad 1
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  // Incrementar cantidad de un producto específico
  const incrementarCantidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, cantidad: (p.cantidad || 1) + 1 }
          : p
      )
    );
  };

  // Decrementar cantidad de un producto específico (eliminar si llega a 0)
  const decrementarCantidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevaCantidad = (p.cantidad || 1) - 1;
          return nuevaCantidad <= 0 ? null : { ...p, cantidad: nuevaCantidad };
        }
        return p;
      }).filter((p) => p !== null) as Producto[]
    );
  };

  const limpiarCarrito = () => setCarrito([]);

  const calcularTotal = () => {
    return carrito.reduce((total, producto) => {
      return total + producto.precio * (producto.cantidad || 1);
    }, 0);
  };

  const cantidadProductos = () => {
    return carrito.reduce((total, producto) => {
      return total + (producto.cantidad || 1);
    }, 0);
  };

  // Función original para compatibilidad hacia atrás
  const finalizarCompra = async (id_usuario: number, id_ubicacion?: number) => {
    try {
      if (carrito.length === 0) {
        return { success: false, message: 'El carrito está vacío' };
      }

      // Calcular el total del pedido
      const total = calcularTotal();

      console.log('🛒 Finalizando compra (método tradicional):', { id_usuario, total, id_ubicacion });

      // Crear el pedido con ubicación
      const pedidoResponse = await createPedido({
        id_usuario,
        total,
        id_ubicacion,
      }) as any;

      if (!pedidoResponse.success) {
        return { success: false, message: 'Error al crear el pedido' };
      }

      const pedido = pedidoResponse.pedido;

      // Crear los productos del pedido usando el ID de la API externa
      for (const producto of carrito) {
        await createPedidoProducto({
          id_pedido: pedido.id_pedido,
          id_producto: producto.id, // ID del producto de fakestoreapi
          cantidad: producto.cantidad || 1,
          precio: producto.precio,
        });
      }

      // Limpiar el carrito después de crear el pedido
      limpiarCarrito();

      return {
        success: true,
        message: 'Pedido creado exitosamente',
        pedido,
      };
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      return { success: false, message: 'Error al procesar el pedido' };
    }
  };

  // Nueva función para compras multi-vendedor
  const finalizarCompraMultiVendedor = async (id_usuario: number, id_ubicacion?: number) => {
    try {
      if (carrito.length === 0) {
        return { success: false, message: 'El carrito está vacío' };
      }

      console.log('🛒 Finalizando compra multi-vendedor:', { 
        id_usuario, 
        productos: carrito.length, 
        id_ubicacion 
      });

      // Procesar compra con división automática por vendedor
      const resultado = await procesarCompraMultiVendedor({
        id_usuario,
        productos: carrito,
        id_ubicacion: id_ubicacion as number,
      }) as any;

      if (!resultado.success) {
        return { success: false, message: resultado.message || 'Error al procesar la compra' };
      }

      // Limpiar el carrito después de crear el pedido
      limpiarCarrito();

      return {
        success: true,
        message: resultado.message,
        resultado,
      };
    } catch (error) {
      console.error('Error al finalizar compra multi-vendedor:', error);
      return { success: false, message: 'Error al procesar el pedido' };
    }
  };



  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        incrementarCantidad,
        decrementarCantidad,
        limpiarCarrito,
        finalizarCompra,
        finalizarCompraMultiVendedor,
        calcularTotal,
        cantidadProductos,
      }}
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

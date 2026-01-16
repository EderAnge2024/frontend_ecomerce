import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  buscarProductosPresencial, 
  crearVentaPresencial, 
  obtenerResumenVentasDelDia 
} from '../../../../components/services/store/ventaPresencial';
import { useAuth } from '../../../../components/context/authContext';

const VentaPresencial = () => {
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  
  // Estados del modal de cliente
  const [modalCliente, setModalCliente] = useState(false);
  const [modalCarrito, setModalCarrito] = useState(false);
  const [modalComprobante, setModalComprobante] = useState(false);
  const [comprobanteData, setComprobanteData] = useState(null);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    notas: ''
  });
  
  // Estados del resumen del día
  const [resumenDia, setResumenDia] = useState(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarProductos();
    cargarResumenDelDia();
  }, []);
  
  // Buscar productos cuando cambie la búsqueda o categoría
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProductos();
    }, 500); // Debounce de 500ms
    
    return () => clearTimeout(timeoutId);
  }, [busqueda, categoriaSeleccionada]);
  
  // Cargar productos
  const cargarProductos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando productos con filtros:', { busqueda, categoriaSeleccionada });
      
      const response = await buscarProductosPresencial({
        search: busqueda,
        categoria: categoriaSeleccionada,
        limit: 50
      });
      
      console.log('📦 Respuesta del servidor:', response);
      
      if (response.success) {
        setProductos(response.productos);
        setCategorias(response.categorias);
        console.log(`✅ Productos cargados: ${response.productos.length}`);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      Alert.alert('Error', 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar resumen del día
  const cargarResumenDelDia = async () => {
    try {
      const response = await obtenerResumenVentasDelDia();
      if (response.success) {
        setResumenDia(response);
      }
    } catch (error) {
      console.error('Error cargando resumen del día:', error);
    }
  };
  
  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([cargarProductos(), cargarResumenDelDia()]);
    setRefreshing(false);
  };
  
  // Buscar productos
  const buscarProductos = async () => {
    try {
      setLoading(true);
      const response = await buscarProductosPresencial({
        search: busqueda,
        categoria: categoriaSeleccionada,
        limit: 50
      });
      
      if (response.success) {
        setProductos(response.productos);
        setCategorias(response.categorias);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };
  
  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existeEnCarrito = carrito.find(item => item.id_producto === producto.id_producto);
    
    if (existeEnCarrito) {
      if (existeEnCarrito.cantidad >= producto.stock_disponible) {
        Alert.alert('Stock insuficiente', `Solo hay ${producto.stock_disponible} unidades disponibles`);
        return;
      }
      
      setCarrito(carrito.map(item =>
        item.id_producto === producto.id_producto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id_producto: producto.id_producto,
        title: producto.title,
        price: parseFloat(producto.price),
        cantidad: 1,
        stock_disponible: producto.stock_disponible,
        image: producto.image,
        category: producto.category
      }]);
    }
    
    Alert.alert('Producto agregado', `${producto.title} agregado al carrito`);
  };
  
  // Modificar cantidad en carrito
  const modificarCantidadCarrito = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.id_producto !== id_producto));
      return;
    }
    
    const producto = carrito.find(item => item.id_producto === id_producto);
    if (nuevaCantidad > producto.stock_disponible) {
      Alert.alert('Stock insuficiente', `Solo hay ${producto.stock_disponible} unidades disponibles`);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.id_producto === id_producto
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };
  
  // Calcular total del carrito
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);
  };
  
  // Procesar venta
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Debe agregar al menos un producto');
      return;
    }
    
    if (!datosCliente.nombre.trim()) {
      Alert.alert('Datos incompletos', 'El nombre del cliente es requerido');
      return;
    }
    
    try {
      setLoading(true);
      
      const ventaData = {
        cliente_nombre: datosCliente.nombre,
        cliente_apellido: datosCliente.apellido,
        cliente_correo: datosCliente.correo,
        cliente_telefono: datosCliente.telefono,
        cliente_direccion: datosCliente.direccion,
        notas: datosCliente.notas || 'Venta presencial',
        productos: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.price
        }))
      };
      
      const response = await crearVentaPresencial(ventaData);
      
      if (response && response.success && response.pedido) {
        // Venta exitosa - limpiar todo automáticamente
        setModalCliente(false);
        limpiarVenta();
        
        // Mostrar mensaje de éxito simple
        Alert.alert(
          '✅ Venta Completada',
          `Pedido #${response.pedido.id_pedido} registrado exitosamente\nTotal: S/ ${response.pedido.total.toFixed(2)}`,
          [{ text: 'OK' }]
        );
        
        // Recargar productos y resumen
        cargarProductos();
        cargarResumenDelDia();
      } else {
        Alert.alert('Error', response?.message || 'Error al procesar la venta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la venta');
      console.error('Error procesando venta:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener datos del comprobante
  const obtenerDatosComprobante = async (id_pedido) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_BASE_URL}/comprobantes/preview/${id_pedido}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setComprobanteData(data.data);
        setModalComprobante(true);
      } else {
        Alert.alert('Error', 'No se pudieron obtener los datos del comprobante');
      }
    } catch (error) {
      console.error('Error obteniendo datos del comprobante:', error);
      Alert.alert('Error', 'Error al obtener los datos del comprobante');
    }
  };
  
  // Abrir comprobante
  const abrirComprobante = async (id_pedido) => {
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró token de autenticación');
        return;
      }
      
      // Crear URL con token como parámetro
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
      const comprobanteUrl = `${API_BASE_URL}/comprobantes/generar-url/${id_pedido}?token=${token}`;
      await Linking.openURL(comprobanteUrl);
    } catch (error) {
      console.error('Error abriendo comprobante:', error);
      Alert.alert('Error', 'No se pudo abrir el comprobante');
    }
  };
  
  // Limpiar venta
  const limpiarVenta = () => {
    // Limpiar carrito
    setCarrito([]);
    
    // Limpiar datos del cliente
    setDatosCliente({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      direccion: '',
      notas: ''
    });
    
    // Cerrar todos los modales
    setModalCliente(false);
    setModalCarrito(false);
    setModalComprobante(false);
    
    // Limpiar datos del comprobante
    setComprobanteData(null);
    
    console.log('🧹 Venta limpiada - listo para nueva venta');
  };
  
  // Renderizar producto
  const renderProducto = ({ item }) => (
    <View style={styles.productoCard}>
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.productoImagen}
          onError={() => console.log('Error cargando imagen del producto')}
        />
      ) : (
        <View style={[styles.productoImagen, styles.placeholderImagen]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productoCategoria}>{item.category}</Text>
        <Text style={styles.productoPrecio}>S/ {parseFloat(item.price).toFixed(2)}</Text>
        <Text style={[
          styles.productoStock, 
          item.stock_disponible <= 0 && styles.productoStockAgotado,
          item.stock_disponible <= 5 && item.stock_disponible > 0 && styles.productoStockBajo
        ]}>
          {item.stock_disponible <= 0 ? 'Agotado' : `Stock: ${item.stock_disponible}`}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.agregarBtn, item.stock_disponible <= 0 && styles.agregarBtnDisabled]}
        onPress={() => agregarAlCarrito(item)}
        disabled={item.stock_disponible <= 0}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
  
  // Renderizar item del carrito
  const renderItemCarrito = ({ item }) => (
    <View style={styles.carritoItem}>
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.carritoImagen}
          onError={() => console.log('Error cargando imagen del carrito')}
        />
      ) : (
        <View style={[styles.carritoImagen, styles.placeholderImagenCarrito]}>
          <Ionicons name="image-outline" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.carritoInfo}>
        <Text style={styles.carritoNombre} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.carritoPrecio}>S/ {item.price.toFixed(2)} c/u</Text>
        <Text style={styles.carritoCategoria}>{item.category}</Text>
        {item.stock_disponible <= 5 && (
          <Text style={styles.carritoStockBajo}>
            ⚠️ Stock bajo: {item.stock_disponible} disponibles
          </Text>
        )}
      </View>
      <View style={styles.carritoControles}>
        <TouchableOpacity
          style={styles.cantidadBtn}
          onPress={() => modificarCantidadCarrito(item.id_producto, item.cantidad - 1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cantidadText}>{item.cantidad}</Text>
        <TouchableOpacity
          style={styles.cantidadBtn}
          onPress={() => modificarCantidadCarrito(item.id_producto, item.cantidad + 1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.carritoSubtotal}>S/ {(item.price * item.cantidad).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="storefront-outline" size={32} color="#221329" />
          <Text style={styles.headerTitle}>Punto de Venta</Text>
        </View>
        <TouchableOpacity
          style={styles.resumenBtn}
          onPress={() => setMostrarResumen(true)}
        >
          <Ionicons name="analytics-outline" size={24} color="#221329" />
        </TouchableOpacity>
      </View>

      {/* Búsqueda y filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.busquedaContainer}>
          <TextInput
            style={styles.busquedaInput}
            placeholder="Buscar productos..."
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={buscarProductos}
          />
          <TouchableOpacity style={styles.buscarBtn} onPress={buscarProductos}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
          <TouchableOpacity
            style={[styles.categoriaBtn, !categoriaSeleccionada && styles.categoriaBtnActiva]}
            onPress={() => {
              setCategoriaSeleccionada('');
              // Buscar inmediatamente sin filtro de categoría
              buscarProductosPresencial({
                search: busqueda,
                categoria: '',
                limit: 50
              }).then(response => {
                if (response.success) {
                  setProductos(response.productos);
                }
              });
            }}
          >
            <Text style={[styles.categoriaBtnText, !categoriaSeleccionada && styles.categoriaBtnTextActiva]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[styles.categoriaBtn, categoriaSeleccionada === categoria && styles.categoriaBtnActiva]}
              onPress={() => {
                setCategoriaSeleccionada(categoria);
                // Buscar inmediatamente con la nueva categoría
                buscarProductosPresencial({
                  search: busqueda,
                  categoria: categoria,
                  limit: 50
                }).then(response => {
                  if (response.success) {
                    setProductos(response.productos);
                  }
                });
              }}
            >
              <Text style={[styles.categoriaBtnText, categoriaSeleccionada === categoria && styles.categoriaBtnTextActiva]}>
                {categoria}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido principal */}
      <View style={styles.contenidoPrincipal}>
        {/* Lista de productos - ahora ocupa todo el ancho */}
        <View style={styles.productosContainer}>
          <Text style={styles.seccionTitulo}>Productos Disponibles</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#221329" style={styles.loader} />
          ) : (
            <FlatList
              data={productos}
              renderItem={renderProducto}
              keyExtractor={(item) => item.id_producto.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productosRow}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productosListContainer}
            />
          )}
        </View>
      </View>

      {/* Botón flotante del carrito */}
      {carrito.length > 0 && (
        <TouchableOpacity
          style={styles.carritoFloatBtn}
          onPress={() => setModalCarrito(true)}
          activeOpacity={0.8}
        >
          <View style={styles.carritoFloatContent}>
            <View style={styles.carritoFloatInfo}>
              <View style={styles.carritoIconContainer}>
                <Ionicons name="cart" size={24} color="#fff" />
                <View style={styles.carritoContador}>
                  <Text style={styles.carritoContadorText}>
                    {carrito.reduce((total, item) => total + item.cantidad, 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.carritoFloatTexto}>
                <Text style={styles.carritoFloatItems}>
                  {carrito.length} productos
                </Text>
                <Text style={styles.carritoFloatTotal}>S/ {calcularTotal().toFixed(2)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-up" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* Mensaje cuando no hay productos en el carrito */}
      {carrito.length === 0 && (
        <View style={styles.carritoVacioFloat}>
          <Text style={styles.carritoVacioFloatText}>Carrito vacío - Agrega productos para comenzar</Text>
        </View>
      )}

      {/* Modal de detalle del carrito */}
      <Modal
        visible={modalCarrito}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCarrito(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Detalle del Carrito</Text>
              <TouchableOpacity onPress={() => setModalCarrito(false)}>
                <Ionicons name="close" size={24} color="#221329" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {carrito.map((item) => (
                <View key={item.id_producto} style={styles.carritoDetalleItem}>
                  {item.image ? (
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.carritoDetalleImagen}
                    />
                  ) : (
                    <View style={[styles.carritoDetalleImagen, styles.placeholderImagenDetalle]}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.carritoDetalleInfo}>
                    <Text style={styles.carritoDetalleNombre}>{item.title}</Text>
                    <Text style={styles.carritoDetalleCategoria}>{item.category}</Text>
                    <Text style={styles.carritoDetallePrecio}>S/ {item.price.toFixed(2)} c/u</Text>
                    
                    <View style={styles.carritoDetalleControles}>
                      <TouchableOpacity
                        style={styles.carritoDetalleCantidadBtn}
                        onPress={() => modificarCantidadCarrito(item.id_producto, item.cantidad - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#fff" />
                      </TouchableOpacity>
                      <Text style={styles.carritoDetalleCantidadText}>{item.cantidad}</Text>
                      <TouchableOpacity
                        style={styles.carritoDetalleCantidadBtn}
                        onPress={() => modificarCantidadCarrito(item.id_producto, item.cantidad + 1)}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    
                    {item.stock_disponible <= 5 && (
                      <Text style={styles.carritoDetalleStockBajo}>
                        ⚠️ Stock bajo: {item.stock_disponible} disponibles
                      </Text>
                    )}
                  </View>
                  <Text style={styles.carritoDetalleSubtotal}>
                    S/ {(item.price * item.cantidad).toFixed(2)}
                  </Text>
                </View>
              ))}
              
              <View style={styles.carritoDetalleTotal}>
                <Text style={styles.carritoDetalleTotalText}>
                  Total General: S/ {calcularTotal().toFixed(2)}
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={styles.modalLimpiarBtn}
                onPress={() => {
                  setCarrito([]);
                  setModalCarrito(false);
                }}
              >
                <Text style={styles.modalLimpiarText}>Limpiar Carrito</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmarBtn}
                onPress={() => {
                  setModalCarrito(false);
                  setModalCliente(true);
                }}
              >
                <Text style={styles.modalConfirmarText}>Procesar Venta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de datos del cliente */}
      <Modal
        visible={modalCliente}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCliente(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Datos del Cliente</Text>
              <TouchableOpacity onPress={() => setModalCliente(false)}>
                <Ionicons name="close" size={24} color="#221329" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre *"
                value={datosCliente.nombre}
                onChangeText={(text) => setDatosCliente({...datosCliente, nombre: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Apellido"
                value={datosCliente.apellido}
                onChangeText={(text) => setDatosCliente({...datosCliente, apellido: text})}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                value={datosCliente.correo}
                onChangeText={(text) => setDatosCliente({...datosCliente, correo: text})}
                keyboardType="email-address"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Teléfono"
                value={datosCliente.telefono}
                onChangeText={(text) => setDatosCliente({...datosCliente, telefono: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Dirección"
                value={datosCliente.direccion}
                onChangeText={(text) => setDatosCliente({...datosCliente, direccion: text})}
              />
              
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Notas adicionales"
                value={datosCliente.notas}
                onChangeText={(text) => setDatosCliente({...datosCliente, notas: text})}
                multiline
                numberOfLines={3}
              />
            </ScrollView>
            
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={styles.modalCancelarBtn}
                onPress={() => setModalCliente(false)}
              >
                <Text style={styles.modalCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmarBtn}
                onPress={procesarVenta}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmarText}>Confirmar Venta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de comprobante */}
      <Modal
        visible={modalComprobante}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalComprobante(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.comprobanteModalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Comprobante de Venta</Text>
              <TouchableOpacity onPress={() => setModalComprobante(false)}>
                <Ionicons name="close" size={24} color="#221329" />
              </TouchableOpacity>
            </View>
            
            {comprobanteData && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.comprobanteContainer}>
                  {/* Header del comprobante */}
                  <View style={styles.comprobanteHeader}>
                    <Text style={styles.comprobanteEmpresa}>ECOMMERCE STORE</Text>
                    <Text style={styles.comprobanteTipo}>COMPROBANTE DE VENTA</Text>
                    <Text style={styles.comprobanteNumero}>#{comprobanteData.pedido.id_pedido}</Text>
                  </View>
                  
                  {/* Información del cliente */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>DATOS DEL CLIENTE</Text>
                    <Text style={styles.comprobanteTexto}>
                      {comprobanteData.cliente.nombre} {comprobanteData.cliente.apellido}
                    </Text>
                    {comprobanteData.cliente.correo && (
                      <Text style={styles.comprobanteTexto}>{comprobanteData.cliente.correo}</Text>
                    )}
                    {comprobanteData.cliente.telefono && (
                      <Text style={styles.comprobanteTexto}>{comprobanteData.cliente.telefono}</Text>
                    )}
                  </View>
                  
                  {/* Información de la venta */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>INFORMACIÓN DE VENTA</Text>
                    <Text style={styles.comprobanteTexto}>
                      Fecha: {new Date(comprobanteData.pedido.fecha_pedido).toLocaleDateString()}
                    </Text>
                    <Text style={styles.comprobanteTexto}>Estado: {comprobanteData.pedido.estado}</Text>
                    <Text style={styles.comprobanteTexto}>Tipo: Venta Presencial</Text>
                  </View>
                  
                  {/* Productos */}
                  <View style={styles.comprobanteSeccion}>
                    <Text style={styles.comprobanteSectionTitle}>PRODUCTOS</Text>
                    {comprobanteData.productos.map((producto, index) => (
                      <View key={index} style={styles.comprobanteProducto}>
                        <Text style={styles.comprobanteProductoNombre}>{producto.title}</Text>
                        <View style={styles.comprobanteProductoDetalle}>
                          <Text style={styles.comprobanteTexto}>
                            {producto.cantidad} x S/ {parseFloat(producto.precio).toFixed(2)}
                          </Text>
                          <Text style={styles.comprobanteProductoTotal}>
                            S/ {(producto.cantidad * parseFloat(producto.precio)).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  {/* Total */}
                  <View style={styles.comprobanteTotal}>
                    <Text style={styles.comprobanteTotalTexto}>
                      TOTAL: S/ {parseFloat(comprobanteData.pedido.total).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
            
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={styles.modalCancelarBtn}
                onPress={() => {
                  setModalComprobante(false);
                  limpiarVenta();
                }}
              >
                <Text style={styles.modalCancelarText}>Cerrar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmarBtn}
                onPress={() => {
                  if (comprobanteData) {
                    abrirComprobante(comprobanteData.pedido.id_pedido);
                  }
                  setModalComprobante(false);
                  limpiarVenta();
                }}
              >
                <Text style={styles.modalConfirmarText}>Descargar PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de resumen del día */}
      <Modal
        visible={mostrarResumen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarResumen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Resumen del Día</Text>
              <TouchableOpacity onPress={() => setMostrarResumen(false)}>
                <Ionicons name="close" size={24} color="#221329" />
              </TouchableOpacity>
            </View>
            
            {resumenDia && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.resumenCard}>
                  <Text style={styles.resumenFecha}>{resumenDia.fecha}</Text>
                  
                  <View style={styles.resumenStats}>
                    <View style={styles.resumenStat}>
                      <Text style={styles.resumenStatNumero}>{resumenDia.resumen.total_pedidos}</Text>
                      <Text style={styles.resumenStatLabel}>Total Pedidos</Text>
                    </View>
                    
                    <View style={styles.resumenStat}>
                      <Text style={styles.resumenStatNumero}>S/ {resumenDia.resumen.total_ventas.toFixed(2)}</Text>
                      <Text style={styles.resumenStatLabel}>Total Ventas</Text>
                    </View>
                    
                    <View style={styles.resumenStat}>
                      <Text style={styles.resumenStatNumero}>{resumenDia.resumen.ventas_presenciales}</Text>
                      <Text style={styles.resumenStatLabel}>Ventas Presenciales</Text>
                    </View>
                  </View>
                  
                  {resumenDia.productos_mas_vendidos.length > 0 && (
                    <View style={styles.productosPopulares}>
                      <Text style={styles.productosPopularesTitle}>Productos Más Vendidos</Text>
                      {resumenDia.productos_mas_vendidos.map((producto, index) => (
                        <View key={index} style={styles.productoPopular}>
                          <Text style={styles.productoPopularNombre}>{producto.title}</Text>
                          <Text style={styles.productoPopularCantidad}>{producto.cantidad_vendida} vendidos</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Botón para ver todas las ventas del día */}
                  <TouchableOpacity
                    style={styles.verVentasBtn}
                    onPress={() => {
                      setMostrarResumen(false);
                      // Aquí podrías navegar a una pantalla de historial de ventas
                      Alert.alert('Información', 'Funcionalidad de historial de ventas disponible en el módulo de pedidos');
                    }}
                  >
                    <Ionicons name="list-outline" size={20} color="#fff" />
                    <Text style={styles.verVentasBtnText}>Ver Todas las Ventas</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
    marginLeft: 12,
  },
  resumenBtn: {
    padding: 8,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busquedaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  busquedaInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  buscarBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#221329',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasScroll: {
    flexGrow: 0,
  },
  categoriaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoriaBtnActiva: {
    backgroundColor: '#221329',
  },
  categoriaBtnText: {
    fontSize: 14,
    color: '#666',
  },
  categoriaBtnTextActiva: {
    color: '#fff',
  },
  contenidoPrincipal: {
    flex: 1,
  },
  productosContainer: {
    flex: 1,
    padding: 16,
  },
  productosListContainer: {
    paddingBottom: 100, // Espacio para el botón flotante
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 16,
  },
  loader: {
    marginTop: 50,
  },
  // Estilos del botón flotante del carrito
  carritoFloatBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#221329',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  carritoFloatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  carritoFloatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carritoIconContainer: {
    position: 'relative',
  },
  carritoContador: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#221329',
  },
  carritoContadorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  carritoFloatTexto: {
    marginLeft: 12,
  },
  carritoFloatItems: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  carritoFloatTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Mensaje de carrito vacío
  carritoVacioFloat: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  carritoVacioFloatText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  productosRow: {
    justifyContent: 'space-between',
  },
  productoCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productoImagen: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImagen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  productoStock: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
  },
  productoStockBajo: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  productoStockAgotado: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  agregarBtn: {
    backgroundColor: '#221329',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  agregarBtnDisabled: {
    backgroundColor: '#ccc',
  },
  carritoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carritoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
  },
  carritoVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carritoVacioText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  carritoLista: {
    flex: 1,
    marginBottom: 16,
  },
  carritoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  carritoImagen: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImagenCarrito: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carritoInfo: {
    flex: 1,
  },
  carritoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  carritoPrecio: {
    fontSize: 12,
    color: '#666',
  },
  carritoCategoria: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  carritoStockBajo: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 2,
  },
  carritoControles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cantidadBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#221329',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  carritoSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#221329',
    minWidth: 60,
    textAlign: 'right',
  },
  carritoAcciones: {
    flexDirection: 'row',
    gap: 6,
  },
  limpiarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#221329',
    alignItems: 'center',
  },
  limpiarBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#221329',
  },
  verCarritoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  verCarritoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  procesarBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#221329',
    alignItems: 'center',
  },
  procesarBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalAcciones: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalCancelarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#221329',
    alignItems: 'center',
  },
  modalCancelarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
  },
  modalConfirmarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#221329',
    alignItems: 'center',
  },
  modalConfirmarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalLimpiarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    alignItems: 'center',
    marginRight: 8,
  },
  modalLimpiarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  resumenCard: {
    padding: 16,
  },
  resumenFecha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    textAlign: 'center',
    marginBottom: 20,
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  resumenStat: {
    alignItems: 'center',
  },
  resumenStatNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221329',
  },
  resumenStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productosPopulares: {
    marginTop: 20,
  },
  productosPopularesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 12,
  },
  productoPopular: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productoPopularNombre: {
    fontSize: 14,
    color: '#221329',
    flex: 1,
  },
  productoPopularCantidad: {
    fontSize: 14,
    color: '#666',
  },
  verVentasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  verVentasBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  // Estilos para el modal de detalle del carrito
  carritoDetalleItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  carritoDetalleImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImagenDetalle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carritoDetalleInfo: {
    flex: 1,
  },
  carritoDetalleNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 4,
  },
  carritoDetalleCategoria: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  carritoDetallePrecio: {
    fontSize: 14,
    color: '#221329',
    marginBottom: 8,
  },
  carritoDetalleControles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  carritoDetalleCantidadBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#221329',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carritoDetalleCantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  carritoDetalleStockBajo: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 4,
  },
  carritoDetalleSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#221329',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  carritoDetalleTotal: {
    padding: 16,
    backgroundColor: '#221329',
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  carritoDetalleTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Estilos para el modal del comprobante
  comprobanteModalContainer: {
    maxHeight: '90%',
    width: '95%',
  },
  comprobanteContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  comprobanteHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#221329',
  },
  comprobanteEmpresa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 5,
  },
  comprobanteTipo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  comprobanteNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#221329',
  },
  comprobanteSeccion: {
    marginBottom: 20,
  },
  comprobanteSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#221329',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  comprobanteTexto: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  comprobanteProducto: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  comprobanteProductoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#221329',
    marginBottom: 4,
  },
  comprobanteProductoDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comprobanteProductoTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#221329',
  },
  comprobanteTotal: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#221329',
    alignItems: 'center',
  },
  comprobanteTotalTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#221329',
  },
});

export default VentaPresencial;
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Importar pantallas de Prueba
import InicioScreen from "../screens/InicioScreen";
import PerfilScreen from "../screens/PerfilScreen";
import ProductosScreen from "../screens/ProductosScreen";
import CarritoScreen from "../screens/CarritoScreen";

const Tab = createBottomTabNavigator();

const Navigation = () => {
  // Renderización de iconos de acuerdo a la seccion de menu
  const renderIcon = (routeName, focused, color, size) => {
    const icons = {
      Inicio: focused ? "home" : "home-outline",
      Menú: focused ? "menu" : "grid-outline",
      Carrito: focused ? "cart" : "cart-outline",
      Perfil: focused ? "person" : "person-outline",
    };
    return <Ionicons name={icons[routeName]} size={size} color={color} />;
  };

  return (
    // Barra inferior
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // headerShown: true,
        // tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) =>
          renderIcon(route.name, focused, color, size),
        tabBarActiveTintColor: "#221329ff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingVertical: 8,
          height: 65,
        },
        headerTitleAlign: "center",
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen
        name="Menu"
        component={ProductosScreen}
        options={{ tabBarLabel: "Menú" }}
      />
      {/* <Tab.Screen name="Carrito" component={CarritoScreen} /> */}
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

export default Navigation;

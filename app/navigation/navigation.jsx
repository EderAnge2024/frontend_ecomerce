import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../components/context/authContext";

// Importar pantallas
import InicioScreen from "../modules/inicio/InicioScreen";
import PerfilScreen from "../modules/perfil/PerfilScreen";
import ProductosScreen from "../modules/menu/ProductosScreen";
import CarritoScreen from "../screens/CarritoScreen";
import Login from "../auth/Login";
import AdminHome from "../modules/admin/AdminHome";

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const { isAuthenticated } = useAuth();

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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
        name="Menú"
        component={ProductosScreen}
        options={{ tabBarLabel: "Menú" }}
      />

      <Tab.Screen name="Perfil" component={isAuthenticated ? PerfilScreen : Login} />
      
      {/* Pantalla de Admin (sin tab) */}
      <Tab.Screen 
        name="AdminHome" 
        component={AdminHome}
        options={{
          tabBarButton: () => null, // Ocultar del tab bar
          tabBarStyle: { display: 'none' }, // Ocultar tab bar en esta pantalla
        }}
      />
    </Tab.Navigator>
  );
};

export default Navigation;

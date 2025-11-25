import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Importar pantallas
import InicioScreen from "../modules/inicio/InicioScreen";
import PerfilScreen from "../modules/perfil/PerfilScreen";
import ProductosScreen from "../modules/menu/ProductosScreen";
import AdminHome from "../modules/admin/AdminHome";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator con las 3 pantallas principales (sin AdminHome)
const TabNavigator = () => {
  // Renderización de iconos de acuerdo a la seccion de menu
  const renderIcon = (routeName, focused, color, size) => {
    const icons = {
      Inicio: focused ? "home" : "home-outline",
      Menú: focused ? "menu" : "grid-outline",
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
          height: 60,
          paddingBottom: 2,
          paddingTop: 2,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

// Stack Navigator principal que incluye Tabs y AdminHome como pantalla separada
const Navigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tabs principales (Inicio, Menú, Perfil) */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Panel de Admin como pantalla separada (no aparece en tabs) */}
      <Stack.Screen 
        name="AdminHome" 
        component={AdminHome}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

export default Navigation;

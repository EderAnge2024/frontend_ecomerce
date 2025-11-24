import React from 'react';
import { useNavigationState } from '@react-navigation/native';
import Header from './header';

const ConditionalHeader = () => {
  // Obtener el nombre de la ruta actual
  const currentRouteName = useNavigationState(state => {
    if (!state) return null;
    const route = state.routes[state.index];
    return route.name;
  });
  
  // Mostrar header solo en Inicio y Menú
  const showHeader = ['Inicio', 'Menú'].includes(currentRouteName);
  
  return showHeader ? <Header /> : null;
};

export default ConditionalHeader;

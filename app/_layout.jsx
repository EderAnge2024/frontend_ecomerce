import React from 'react';
import { CartProvider } from '../components/context/carritoContext';
import Navigation from './navigation/navigation';
import Header from './navigation/header';

export default function Layout() {
  return (
    <CartProvider>
      <Header />
      <Navigation /> {/* Bottom Tabs sin NavigationContainer */}
    </CartProvider>
  );
}

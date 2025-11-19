import React from 'react';
import { CartProvider } from '../components/context/carritoContext';
import { AuthProvider } from '../components/context/authContext';
import Navigation from './navigation/navigation';
import Header from './navigation/header';

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <Navigation /> 
      </CartProvider>
    </AuthProvider>
  );
}

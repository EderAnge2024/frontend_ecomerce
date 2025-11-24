import React from 'react';
import { CartProvider } from '../components/context/carritoContext';
import { AuthProvider } from '../components/context/authContext';
import { SearchProvider } from './context/searchContext';
import Navigation from './navigation/navigation';
import ConditionalHeader from './navigation/ConditionalHeader';
import Header from './navigation/header';

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <Header/>
          <Navigation /> 
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

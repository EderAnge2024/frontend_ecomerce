import React from 'react';
import { CartProvider } from '../components/context/carritoContext';
import Navigation from './navigation/navigation';
import Header from './navigation/header';
import Register from './auth/Register';
// import MyContactenos from './modules/perfil/mycontactenos';
export default function Layout() {
  return (
    <CartProvider>
      <Header />
      {/* <MyProfile/> */}
      {/* <MyDirection/> */}
      <Navigation /> 
      {/* <MyCompra/> */}
      {/* <MyContactenos/>   */}
      {/* <Register/> */}
    </CartProvider>
  );
}

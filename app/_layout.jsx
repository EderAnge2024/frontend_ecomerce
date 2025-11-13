import React from 'react';
import { Stack } from 'expo-router';
import Navigation from './navigation/navigation';
import Header from './navigation/header';
export default function Layout() {
  return (
    <>
    <Header></Header>
      <Stack.Screen options={{ headerShown: false }} />
      <Navigation />
    </>
  );
}

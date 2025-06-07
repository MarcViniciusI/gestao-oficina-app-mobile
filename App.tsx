import React from 'react';
import { registerRootComponent } from 'expo';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}

// Registrar o componente principal
registerRootComponent(App);
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MaquinasClienteScreen from '../screens/MaquinasClienteScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientDetailsScreen from '../screens/ClientDetailsScreen';
import MachineDetailsScreen from '../screens/MachineDetailsScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  MaquinasCliente: { 
    clienteId: string;
    clienteNome: string;
  };
  AddClient: undefined;
  ClientDetails: { clienteId: string };
  MachineDetails: { 
    maquinaId: string;
    clienteNome: string;
  };
};


const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Home',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="MaquinasCliente" 
          component={MaquinasClienteScreen}
          options={{ 
            title: 'Máquinas do Cliente',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="AddClient" 
          component={AddClientScreen}
          options={{ 
            title: 'Adicionar Cliente',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="ClientDetails" 
          component={ClientDetailsScreen}
          options={{ 
            title: 'Detalhes do Cliente',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
  name="MachineDetails" 
  component={MachineDetailsScreen}
  options={{ 
    title: 'Detalhes da Máquina',
    gestureEnabled: true,
  }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
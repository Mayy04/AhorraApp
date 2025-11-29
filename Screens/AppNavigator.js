import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import PrincipalScreen from '../Screens/PrincipalScreen';
import TransaccionesScreen from '../Screens/TransaccionesScreen';
import AnalisisScreen from '../Screens/AnalisisScreen';
import PresupuestosScreen from '../Screens/PresupuestosScreen';
import MetasScreen from '../Screens/MetasScreen';
import PerfilScreen from '../Screens/PerfilScreen';
import InicioSesionScreen from '../Screens/InicioSesionScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Principal"
      screenOptions={{ headerShown: false }} // Oculta el header de stack
    >
      <Stack.Screen name="Principal" component={PrincipalScreen} />
      <Stack.Screen name="Transacciones" component={TransaccionesScreen} />
      <Stack.Screen name="Analisis" component={AnalisisScreen} />
      <Stack.Screen name="Presupuestos" component={PresupuestosScreen} />
      <Stack.Screen name="Metas" component={MetasScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />
    </Stack.Navigator>
  );
}

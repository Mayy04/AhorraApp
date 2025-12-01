// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Importar pantallas
import InicioSesionScreen from './Screens/InicioSesionScreen';
import RegistroScreen from './Screens/RegistroScreen';
import RecuperarContraseñaScreen from './Screens/RecuperarContraseñaScreen';
import Navbar from './Screens/navbar';

const Stack = createStackNavigator();

export default function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="InicioSesion"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="InicioSesion">
          {props => <InicioSesionScreen {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
        <Stack.Screen name="Registro">
          {props => <RegistroScreen {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
        <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseñaScreen} />
        <Stack.Screen name="MainApp">
          {props => <Navbar {...props} usuario={usuarioLogueado} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
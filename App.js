// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';


// Importar pantallas
import RegistroScreen from './Screens/RegistroScreen';
import InicioSesionScreen from './Screens/InicioSesionScreen';
import PrincipalScreen from './Screens/PrincipalScreen';
import RecuperarContraseñaScreen from './Screens/RecuperarContraseñaScreen';
import Navbar from './Screens/navbar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Registro"
        screenOptions={{
          headerShown: false,
          animation: 'fade'
        }}
      >
        <Stack.Screen name="Registro">
          {(props) => <RegistroScreen {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
        <Stack.Screen name="InicioSesion">
          {(props) => <InicioSesionScreen {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
        <Stack.Screen name="MainApp">
          {(props) => <Navbar {...props} usuario={usuarioLogueado} />}
        </Stack.Screen>
        <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseñaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
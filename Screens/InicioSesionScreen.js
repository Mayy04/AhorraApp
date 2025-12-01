import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ScrollView} from 'react-native';
import UsuarioService from '../services/usuarioService';

export default function InicioSesionScreen({ navigation, setUsuarioLogueado }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const usuarioService = new UsuarioService();

  const iniciarSesion = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    setCargando(true);
    const resultado = await usuarioService.iniciarSesion(correo, contrasena);
    setCargando(false);

    if (resultado.error) {
      Alert.alert('Error', resultado.error);
    } else {
      setUsuarioLogueado(resultado.usuario);
      navigation.navigate('MainApp');
    }
  };

  const irARegistro = () => {
    navigation.navigate('Registro');
  };

  const irARecuperar = () => {
    navigation.navigate('RecuperarContraseña');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image 
          source={require('../assets/logoAhorra.png')} 
          style={styles.logo}
        />
        <Text style={styles.titulo}>AHORRA+</Text>
        <Text style={styles.subtitulo}>Controla tus finanzas fácilmente</Text>

        <TextInput
          style={styles.input}
          placeholder='Correo electrónico'
          value={correo}
          onChangeText={setCorreo}
          keyboardType='email-address'
          autoCapitalize='none'
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder='Contraseña'
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity 
          style={[styles.botonPrincipal, cargando && styles.botonDeshabilitado]}
          onPress={iniciarSesion}
          disabled={cargando}
        >
          <Text style={styles.textoBotonPrincipal}>
            {cargando ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSecundario} onPress={irARecuperar}>
          <Text style={styles.textoSecundario}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.separador}>
          <View style={styles.linea} />
          <Text style={styles.textoSeparador}>o</Text>
          <View style={styles.linea} />
        </View>

        <Text style={styles.textoRegistro}>¿No tienes una cuenta?</Text>
        
        <TouchableOpacity style={styles.botonRegistro} onPress={irARegistro}>
          <Text style={styles.textoBotonRegistro}>CREAR CUENTA</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#009c5bff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    opacity: 0.9,
  },
  input: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  botonPrincipal: {
    backgroundColor: '#00D162',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#cccccc',
  },
  textoBotonPrincipal: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 25,
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  textoSeparador: {
    color: '#fff',
    marginHorizontal: 15,
    fontSize: 14,
  },
  textoRegistro: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  botonRegistro: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    padding: 14,
    borderRadius: 12,
    width: '80%',
  },
  textoBotonRegistro: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  botonSecundario:{
    alignSelf: 'flex-end',
    marginRight: '10%',       
    marginTop: 5,
    marginBottom: 10,
  },
  textoSecundario:{
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.8,
  }
});
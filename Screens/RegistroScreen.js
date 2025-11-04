import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import MenuScreen from "./menuScreen";

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
   const [screen, setScreen]=useState('inicio');
  

  const mostrarAlerta = () => {
    if (
      nombre.trim() === '' ||
      correo.trim() === '' ||
      telefono.trim() === '' ||
      contrasena.trim() === '' ||
      confirmar.trim() === ''
    ) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
    } else if (contrasena !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
    } else {
      Alert.alert('Registro exitoso', `¡Bienvenido, ${nombre}!`);
    }
  };
switch(screen){
    case 'regresar':
      return<MenuScreen/>
    case 'inicio':
      default:

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={()=> setScreen('regresar')}>
        <Text style={styles.texto}>Registrarse</Text>
      </TouchableOpacity>
      

      <Text style={styles.texto2}>Ingresa tu nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.texto2}>Ingresa tu correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      <Text style={styles.texto2}>Ingresa tu número telefónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Número telefónico"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <Text style={styles.texto2}>Crea una contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry={true}
      />

      <Text style={styles.texto2}>Confirma tu contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.botones} onPress={mostrarAlerta}>
        <Text style={styles.textoBoton}>REGISTRARSE</Text>
      </TouchableOpacity>
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009c5bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 10,
    marginBottom: 10,
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  texto: {
    color: '#000000',
    fontSize: 30,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  texto2: {
    color: '#000000',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  botones: {
    backgroundColor: '#00D162',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 30,
    marginTop: 10,
    width: '60%',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

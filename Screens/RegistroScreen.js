import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Platform, StyleSheet } from 'react-native';

export default function RegistroScreen() {

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const mostrarAlerta = () => {
    if (nombre.trim() === '' || correo.trim() === '' || telefono.trim() === '' || contrasena.trim() === '' || confirmar.trim() === '') {
      if (Platform.OS === 'web') {
        window.alert('Error: Todos los campos son obligatorios');
      } else {
        Alert.alert('Error', 'Todos los campos son obligatorios');
      }
    } else if (contrasena !== confirmar) {
      if (Platform.OS === 'web') {
        window.alert('Error: Las contraseñas no coinciden');
      } else {
        Alert.alert('Error', 'Las contraseñas no coinciden');
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert(`Registro exitoso: ¡Bienvenido, ${nombre}!`);
      } else {
        Alert.alert('Registro exitoso', `¡Bienvenido, ${nombre}!`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrarse</Text>

      <Text style={styles.label}>Ingresa tu nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Ingresa tu correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Ingresa tu número telefónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Número telefónico"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Crea una contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry={true}
      />

      <Text style={styles.label}>Confirma tu contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry={true}
      />

      <Button color="#00cc66" title="Registrarse" onPress={mostrarAlerta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#53d398',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 25,
  },
  label: {
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});

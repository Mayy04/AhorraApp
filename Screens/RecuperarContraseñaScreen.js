import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';

export default function OlvidarContrasena() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  const enviar = () => {
    if (nombre.trim() === '' || correo.trim() === '') {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos antes de continuar.');
      return;
    }
    Alert.alert('Solicitud enviada', 'Hemos enviado un enlace para restablecer tu contraseña.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>

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
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <TouchableOpacity style={styles.boton} onPress={enviar}>
        <Text style={styles.textoBoton}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CC98A',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: '#00C853',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

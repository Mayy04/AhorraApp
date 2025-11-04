import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

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
      <Text style={styles.texto}>¿Olvidaste tu contraseña?</Text>

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
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <TouchableOpacity style={styles.botones} onPress={enviar}>
        <Text style={styles.textoBoton}>ENVIAR</Text>
      </TouchableOpacity>
    </View>
  );
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

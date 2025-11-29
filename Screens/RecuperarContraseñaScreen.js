import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import MenuScreen from "./menuScreen";
import UsuarioController from "../controllers/usuarioControllers";

const controller = new UsuarioController();

export default function RecuperarContraseñaScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [nuevaContra, setNuevaContra] = useState('');
  const [screen, setScreen] = useState('inicio');
  const [usuario, setUsuario] = useState(null);

  // ------------------------
  // BUSCAR USUARIO (ENVIAR)
  // ------------------------
  const buscarUsuario = async () => {
    console.log("buscarUsuario: inicio");                
    Alert.alert("DEBUG", "buscarUsuario ejecutada");     

    if (nombre.trim() === '' || correo.trim() === '') {
      return Alert.alert('Campos vacíos', 'Por favor completa todos los campos antes de continuar.');
    }

    try {
      const res = await controller.buscarUsuario(nombre, correo);
      console.log("buscarUsuario: res =>", res);

      if (!res) {
        return Alert.alert('Error', 'Respuesta inválida del controlador (res es undefined).');
      }

      if (res.error) return Alert.alert('Error', res.error);

      if (!res.datos || res.datos.length === 0) {
        return Alert.alert('No encontrado', 'No existe un usuario con esos datos.');
      }

      setUsuario(res.datos[0]);
      setScreen('cambiar');
    } catch (e) {
      console.log("buscarUsuario: excepción =>", e);
      return Alert.alert('Error', 'Ocurrió un error al buscar el usuario: ' + (e.message || e));
    }
  };

  // ------------------------
  // CAMBIAR CONTRASEÑA
  // ------------------------
  const cambiarContrasena = async () => {
    if (nuevaContra.trim().length < 4) {
      return Alert.alert('Error', 'La contraseña debe tener mínimo 4 caracteres.');
    }

    try {
      const res = await controller.actualizarContrasena(usuario.id, nuevaContra);
      console.log("cambiarContrasena: res =>", res);

      if (res.error) return Alert.alert('Error', res.error);

      Alert.alert('Éxito', 'La contraseña ha sido actualizada.');
      setScreen('regresar');
    } catch (e) {
      console.log("cambiarContrasena: excepción =>", e);
      Alert.alert('Error', 'Ocurrió un error al actualizar la contraseña: ' + (e.message || e));
    }
  };

  switch (screen) {
    case 'regresar':
      return <MenuScreen />;

    case 'inicio':
    default:
      return (
        <View style={styles.container}>

          {/* botón regresar: mantengo pero reduje su área táctil con hitSlop */}
          <TouchableOpacity onPress={() => setScreen('regresar')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.texto}>¿Olvidaste tu contraseña?</Text>
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
            keyboardType="email-address"
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
          />

          {/* ENVIAR: aseguramos onPress y mostramos log antes de invocar controller */}
          <TouchableOpacity style={styles.botones} onPress={buscarUsuario}>
            <Text style={styles.textoBoton}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      );

    case 'cambiar':
      return (
        <View style={styles.container}>
          <Text style={styles.texto}>Cambiar contraseña</Text>

          <Text style={styles.texto2}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            secureTextEntry
            value={nuevaContra}
            onChangeText={setNuevaContra}
          />

          <TouchableOpacity style={styles.botones} onPress={cambiarContrasena}>
            <Text style={styles.textoBoton}>CAMBIAR</Text>
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
    alignItems: 'center'
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
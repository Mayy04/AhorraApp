import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from "react";
import MenuScreen from "./menuScreen";
import UsuarioController from "../controllers/UsuarioController";

const controller = new UsuarioController();

export default function RecuperarContraseñaScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [nuevaContra, setNuevaContra] = useState('');
  const [screen, setScreen] = useState('inicio');
  const [usuario, setUsuario] = useState(null);

  const buscarUsuario = async () => {
    if (nombre.trim() === '' || correo.trim() === '') {
      return Alert.alert('Campos vacíos', 'Por favor completa todos los campos antes de continuar.');
    }

    const res = await controller.buscarUsuario(nombre, correo);

    if (res.error) return Alert.alert('Error', res.error);

    if (res.datos.length === 0) {
      return Alert.alert('No encontrado', 'No existe un usuario con esos datos.');
    }

    setUsuario(res.datos[0]);
    setScreen('cambiar');
  };

  const cambiarContrasena = async () => {
    if (nuevaContra.trim().length < 4) {
      return Alert.alert('Error', 'La contraseña debe tener mínimo 4 caracteres.');
    }

    const res = await controller.actualizarContrasena(usuario.id, nuevaContra);

    if (res.error) return Alert.alert('Error', res.error);

    Alert.alert('Éxito', 'La contraseña ha sido actualizada.');
    setScreen('regresar');
  };

  switch (screen) {
    case 'regresar':
      return <MenuScreen />;

    // ---------------------------
    case 'inicio':
    default:
      return (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setScreen('regresar')}>
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
          />

          <TouchableOpacity style={styles.botones} onPress={buscarUsuario}>
            <Text style={styles.textoBoton}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      );

    // ---------------------------
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
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

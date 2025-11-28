import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import UsuarioController from "../controllers/UsuarioController";
import MenuScreen from "./menuScreen";

const controller = new UsuarioController();

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [screen, setScreen] = useState("inicio");

  const registrar = async () => {
    if (contrasena !== confirmar) {
      return Alert.alert("Error", "Las contraseñas no coinciden");
    }

    const res = await controller.crearUsuario(nombre, correo, telefono, contrasena);

    if (res.error) {
      return Alert.alert("Error", res.error);
    }

    Alert.alert("Registro exitoso", "Usuario registrado correctamente.");
  };

  if (screen === "regresar") return <MenuScreen />;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setScreen("regresar")}>
        <Text style={styles.titulo}>Registrarse</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Correo</Text>
      <TextInput style={styles.input} value={correo} onChangeText={setCorreo} />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} value={contrasena} onChangeText={setContrasena} secureTextEntry />

      <Text style={styles.label}>Confirmar contraseña</Text>
      <TextInput style={styles.input} value={confirmar} onChangeText={setConfirmar} secureTextEntry />

      <TouchableOpacity style={styles.boton} onPress={registrar}>
        <Text style={styles.botonTexto}>REGISTRARSE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#009c5bff", justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 20, fontWeight: "bold" },
  input: { width: "60%", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 8 },
  boton: { backgroundColor: "#00D162", padding: 12, borderRadius: 8, width: "60%", marginTop: 10 },
  botonTexto: { color: "#fff", fontWeight: "bold", textAlign: "center" }
});

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MenuScreen from "./menuScreen";

export default function RegistroScreen() {
  const [screen, setScreen] = useState("inicio");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const registrar = () => {
    if (contrasena !== confirmar) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (!nombre || !correo || !telefono || !contrasena) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    // Aquí normalmente se llamaría a la BD o controlador
    Alert.alert("Éxito", "Usuario registrado (simulado)");
    setNombre(""); setCorreo(""); setTelefono(""); setContrasena(""); setConfirmar("");
  };

  if (screen === "regresar") return <MenuScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrarse</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} />
      <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={contrasena} onChangeText={setContrasena} />
      <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry value={confirmar} onChangeText={setConfirmar} />

      <TouchableOpacity style={styles.boton} onPress={registrar}>
        <Text style={styles.botonTexto}>REGISTRARSE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#009c5bff", justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 30, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  input: { width: "60%", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  boton: { backgroundColor: "#00D162", padding: 12, borderRadius: 8, width: "60%", marginTop: 10 },
  botonTexto: { color: "#fff", fontWeight: "bold", textAlign: "center" }
});

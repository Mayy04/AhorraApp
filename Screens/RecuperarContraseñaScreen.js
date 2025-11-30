import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MenuScreen from "./menuScreen";
import { UsuarioController } from "../controllers/UsuarioControllers"; 


const controller = new UsuarioController();

export default function RecuperarContraseñaScreen() {

  const [screen, setScreen] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const enviar = async () => {
    try {
      await controller.initialize();

      await controller.cambiarContrasena(
        nombre,
        correo,
        nueva,
        confirmar
      );

      Alert.alert("Listo", "Contraseña actualizada correctamente");

      setNombre(""); 
      setCorreo(""); 
      setNueva(""); 
      setConfirmar("");

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // 🔙 Regresar
  if (screen === "regresar") return <MenuScreen />;

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => setScreen("regresar")} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Volver al Menú</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Recuperar Contraseña</Text>

      <TextInput style={styles.input} placeholder="Nombre de usuario" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <TextInput style={styles.input} placeholder="Nueva contraseña" secureTextEntry value={nueva} onChangeText={setNueva} />
      <TextInput style={styles.input} placeholder="Confirmar nueva contraseña" secureTextEntry value={confirmar} onChangeText={setConfirmar} />

      <TouchableOpacity style={styles.boton} onPress={enviar}>
        <Text style={styles.botonTexto}>CAMBIAR</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#009c5bff", justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 30, marginBottom: 30, fontWeight: "bold", color: "#fff" },
  input: { width: "60%", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  boton: { backgroundColor: "#00D162", padding: 12, borderRadius: 8, width: "60%", marginTop: 10 },
  botonTexto: { color: "#fff", fontWeight: "bold", textAlign: "center" }
});

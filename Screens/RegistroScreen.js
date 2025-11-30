import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MenuScreen from "./menuScreen";
import { UsuarioController } from "../controllers/UsuarioControllers"; 




const controller = new UsuarioController();

export default function RegistroScreen() {

  const [screen, setScreen] = useState("inicio");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const registrar = async () => {
    try {
      await controller.initialize();

      const nuevo = await controller.registrar(
        nombre,
        correo,
        telefono,
        contrasena,
        confirmar
      );

      Alert.alert("Éxito", `Usuario registrado: ${nuevo.nombre}`);

      setNombre(""); 
      setCorreo(""); 
      setTelefono(""); 
      setContrasena(""); 
      setConfirmar("");

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  //  Regresar al menú (igual que antes)
  if (screen === "regresar") return <MenuScreen />;

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => setScreen("regresar")} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Volver al Menú</Text>
      </TouchableOpacity>

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

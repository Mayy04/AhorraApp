import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MenuScreen from "./menuScreen";

export default function RecuperarContraseñaScreen() {
  const [screen, setScreen] = useState("inicio");
  const [correo, setCorreo] = useState("");
  const [nueva, setNueva] = useState("");

  const enviar = () => {
    if (!correo || !nueva) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    // Aquí normalmente se llamaría al controlador o BD
    Alert.alert("Listo", "Contraseña cambiada (simulado)");
    setCorreo(""); setNueva("");
  };

  if (screen === "regresar") return <MenuScreen />;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setScreen("regresar")}>
        <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <TextInput style={styles.input} placeholder="Nueva contraseña" secureTextEntry value={nueva} onChangeText={setNueva} />

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

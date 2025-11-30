import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import UsuarioService from "../Services/usuarioService";

export default function RegistroScreen({ navigation, setUsuarioLogueado }) {

const[nombre,setNombre] = useState("");
const[correo,setCorreo] = useState("");
const[telefono,setTelefono] = useState("");
const[contraseña,setContraseña] = useState("");
const[confirmar,setConfirmar] = useState("");
const[cargando,setCargando] = useState(false);

const usuarioService = new UsuarioService();

 const registrar = async() => {
  if(contraseña !== confirmar){
    Alert.alert("error","las contraseñas no coinciden");
    return;
  }
  setCargando(true);
  const resultado = await usuarioService.crearUsuario(nombre.correo,telefono,contraseña);
  setCargando (false);
  if(resultado.error){
    Alert.alert("Error", resultado.error);
  }else {
      Alert.alert("Éxito", "¡Cuenta creada exitosamente!", [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('InicioSesion') 
        }
      ]);

      setNombre(""); setCorreo(""); setTelefono(""); setContrasena(""); setConfirmar("");
    }
 };

 const irALogin =() =>{
  navigation.navigate('InicioSesion');
 };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Crear Cuenta</Text>
        <Text style={styles.subtitulo}>Comienza tu viaje financiero</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Nombre completo" 
          value={nombre} 
          onChangeText={setNombre} 
          placeholderTextColor="#999"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          value={correo} 
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Teléfono" 
          value={telefono} 
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          secureTextEntry 
          value={contrasena} 
          onChangeText={setContrasena} 
          placeholderTextColor="#999"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Confirmar contraseña" 
          secureTextEntry 
          value={confirmar} 
          onChangeText={setConfirmar} 
          placeholderTextColor="#999"
        />
         <TouchableOpacity 
          style={[styles.boton, cargando && styles.botonDeshabilitado]} 
          onPress={registrar}
          disabled={cargando}
        >
          <Text style={styles.botonTexto}>
            {cargando ? "CREANDO CUENTA..." : "CREAR CUENTA"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSecundario} onPress={irALogin}>
          <Text style={styles.botonSecundarioTexto}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

}
const styles = StyleSheet.create({
   scrollContainer: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    backgroundColor: "#009c5bff", 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 40,
  },
  titulo: { 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#fff" 
  },
   subtitulo: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.9,
  },
  input: { 
    width: "80%", 
    backgroundColor: "#fff", 
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
  },
  boton: { 
    backgroundColor: "#00D162", 
    padding: 16, 
    borderRadius: 12, 
    width: "80%", 
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#cccccc',
  },
  botonTexto: { 
    color: "#fff", 
    fontWeight: "bold", 
    textAlign: "center",
    fontSize: 16,
  },
  botonSecundario: {
    marginTop: 20,
    padding: 10,
  },
  botonSecundarioTexto: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
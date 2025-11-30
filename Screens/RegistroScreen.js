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
} 

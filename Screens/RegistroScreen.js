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
}
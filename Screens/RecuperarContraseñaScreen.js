import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UsuarioService from '../Services/usuarioService';

export default function RecuperarContraseñaScreen() {
  const navigation = useNavigation();
  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [usuarioVerificado, setUsuarioVerificado] = useState(null);

  const usuarioService = new UsuarioService();

  const validarCorreo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(correo);
  };

  const validarTelefono = () => {
    return telefono.length >= 10;
  };

  const validarContrasenas = () => {
    return nuevaContrasena.length >= 4 && nuevaContrasena === confirmarContrasena;
  };

  const verificarUsuario = async () => {
    if (!correo || !telefono) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (!validarCorreo()) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!validarTelefono()) {
      Alert.alert("Error", "El teléfono debe tener al menos 10 dígitos");
      return;
    }

    setCargando(true);
    const resultado = await usuarioService.validarCredencialesRecuperacion(correo, telefono);
    setCargando(false);

    if (resultado.error) {
      Alert.alert("Error", resultado.error);
    } else {
      setUsuarioVerificado(resultado.usuario);
      setPaso(2);
      Alert.alert("Verificación exitosa", "Ahora puedes establecer tu nueva contraseña");
    }
  };
}
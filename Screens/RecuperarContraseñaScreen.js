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
  const reiniciarProceso = () => {
    setPaso(1);
    setCorreo('');
    setTelefono('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setUsuarioVerificado(null);
  };
  return (
    <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Image
                  source={require('../assets/logoAhorra.png')}
                  style={styles.logo}
                />
                <Text style={styles.titulo}>Recuperar Contraseña</Text>
                <Text style={styles.subtitulo}>
                  {paso === 1 
                    ? "Ingresa tus datos para verificar tu identidad"
                    : "Establece tu nueva contraseña"
                  }
                </Text>
              </View>
    
              {/* Indicador de pasos */}
              <View style={styles.pasosContainer}>
                <View style={styles.pasos}>
                  <View style={[styles.paso, paso >= 1 && styles.pasoActivo]}>
                    <Text style={[styles.pasoNumero, paso >= 1 && styles.pasoNumeroActivo]}>1</Text>
                    <Text style={[styles.pasoTexto, paso >= 1 && styles.pasoTextoActivo]}>
                      Verificación
                    </Text>
                  </View>
                  <View style={[styles.lineaPaso, paso >= 2 && styles.lineaPasoActiva]} />
                  <View style={[styles.paso, paso >= 2 && styles.pasoActivo]}>
                    <Text style={[styles.pasoNumero, paso >= 2 && styles.pasoNumeroActivo]}>2</Text>
                    <Text style={[styles.pasoTexto, paso >= 2 && styles.pasoTextoActivo]}>
                      Nueva Contraseña
                    </Text>
                  </View>
                </View>
              </View>
  );
}
      
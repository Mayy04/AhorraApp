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
                   {/* Paso 1: Verificación */}
                   {paso === 1 && (
                     <View style={styles.formContainer}>
                       <View style={styles.inputGroup}>
                         <Text style={styles.label}>
                           <Ionicons name="mail-outline" size={16} color="#007b4a" /> Correo electrónico
                         </Text>
                         <TextInput
                           style={[styles.input, correo && validarCorreo() && styles.inputValido]}
                           placeholder="tu@correo.com"
                           value={correo}
                           onChangeText={setCorreo}
                           keyboardType="email-address"
                           autoCapitalize="none"
                           placeholderTextColor="#999"
                         />
                         {correo && !validarCorreo() && (
                           <Text style={styles.errorText}>Correo electrónico no válido</Text>
                         )}
                       </View>
         
                       <View style={styles.inputGroup}>
                         <Text style={styles.label}>
                           <Ionicons name="call-outline" size={16} color="#007b4a" /> Teléfono
                         </Text>
                         <TextInput
                           style={[styles.input, telefono && validarTelefono() && styles.inputValido]}
                           placeholder="1234567890"
                           value={telefono}
                           onChangeText={setTelefono}
                           keyboardType="phone-pad"
                           placeholderTextColor="#999"
                         />
                         {telefono && !validarTelefono() && (
                           <Text style={styles.errorText}>Mínimo 10 dígitos</Text>
                         )}
                       </View>
         
                       <TouchableOpacity
                         style={[
                           styles.botonPrincipal,
                           (!validarCorreo() || !validarTelefono() || cargando) && styles.botonDeshabilitado
                         ]}
                         onPress={verificarUsuario}
                         disabled={!validarCorreo() || !validarTelefono() || cargando}
                       >
                         <Text style={styles.botonPrincipalTexto}>          {/* Paso 2: Nueva Contraseña */}
                                   {paso === 2 && (
                                     <View style={styles.formContainer}>
                                       {/* Información del usuario verificado */}
                                       {usuarioVerificado && (
                                         <View style={styles.usuarioVerificado}>
                                           <Ionicons name="checkmark-circle" size={24} color="#00A859" />
                                           <View style={styles.usuarioInfo}>
                                             <Text style={styles.usuarioNombre}>{usuarioVerificado.nombre}</Text>
                                             <Text style={styles.usuarioCorreo}>{usuarioVerificado.correo}</Text>
                                           </View>
                                         </View>
                                       )}
                         
                                       <View style={styles.inputGroup}>
                                         <Text style={styles.label}>
                                           <Ionicons name="lock-closed-outline" size={16} color="#007b4a" /> Nueva contraseña
                                         </Text>
                                         <TextInput
                                           style={[
                                             styles.input,
                                             nuevaContrasena && nuevaContrasena.length >= 4 && styles.inputValido
                                           ]}
                                           placeholder="Mínimo 4 caracteres"
                                           value={nuevaContrasena}
                                           onChangeText={setNuevaContrasena}
                                           secureTextEntry
                                           placeholderTextColor="#999"
                                         />
                                         {nuevaContrasena && nuevaContrasena.length < 4 && (
                                           <Text style={styles.errorText}>Mínimo 4 caracteres</Text>
                                         )}
                                       </View>
                         
                                       <View style={styles.inputGroup}>
                                         <Text style={styles.label}>
                                           <Ionicons name="lock-closed-outline" size={16} color="#007b4a" /> Confirmar contraseña
                                         </Text>
                                         <TextInput
                                           style={[
                                             styles.input,
                                             confirmarContrasena && nuevaContrasena === confirmarContrasena && styles.inputValido,
                                             confirmarContrasena && nuevaContrasena !== confirmarContrasena && styles.inputError
                                           ]}
                                           placeholder="Repite tu contraseña"
                                           value={confirmarContrasena}
                                           onChangeText={setConfirmarContrasena}
                                           secureTextEntry
                                           placeholderTextColor="#999"
                                         />
                                         {confirmarContrasena && nuevaContrasena !== confirmarContrasena && (
                                           <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                                         )}
                                         {confirmarContrasena && nuevaContrasena === confirmarContrasena && (
                                           <Text style={styles.successText}>✓ Las contraseñas coinciden</Text>
                                         )}
                                       </View>
                         
                                       <View style={styles.requisitosContrasena}>
                                         <Text style={styles.requisitosTitulo}>Requisitos de contraseña:</Text>
                                         <Text style={[
                                           styles.requisito,
                                           nuevaContrasena.length >= 4 && styles.requisitoCumplido
                                         ]}>
                                           Mínimo 4 caracteres
                                         </Text>
                                         <Text style={[
                                           styles.requisito,
                                           nuevaContrasena === confirmarContrasena && confirmarContrasena && styles.requisitoCumplido
                                         ]}>
                                           Las contraseñas coinciden
                                         </Text>
                                       </View>
                         
                                       <TouchableOpacity
                                         style={[
                                           styles.botonPrincipal,
                                           (!validarContrasenas() || cargando) && styles.botonDeshabilitado
                                         ]}
                                         onPress={cambiarContrasena}
                                         disabled={!validarContrasenas() || cargando}
                                       >
                                         <Text style={styles.botonPrincipalTexto}>
                                           {cargando ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                                         </Text>
                                       </TouchableOpacity>
                         
                                       <View style={styles.botonesSecundarios}>
                                         <TouchableOpacity style={styles.botonSecundario} onPress={reiniciarProceso}>
                                           <Text style={styles.botonSecundarioTexto}>
                                              Volver a verificación
                                           </Text>
                                         </TouchableOpacity>
                                         <TouchableOpacity style={styles.botonSecundario} onPress={volverAlLogin}>
                                           <Text style={styles.botonSecundarioTexto}>
                                             Iniciar sesión
                                           </Text>
                                         </TouchableOpacity>
                                       </View>
                                     </View>
                                   )}
                         
                           {cargando ? 'VERIFICANDO...' : 'VERIFICAR IDENTIDAD'}
                         </Text>
                       </TouchableOpacity>
         
                       <TouchableOpacity style={styles.botonSecundario} onPress={volverAlLogin}>
                         <Text style={styles.botonSecundarioTexto}>
                            Volver al inicio de sesión
                         </Text>
                       </TouchableOpacity>
                     </View>
                   )}
              
          {/* Información de seguridad */}
               <View style={styles.infoSeguridad}>
                     <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
                      <Text style={styles.infoSeguridadTexto}>
                        Tus datos están protegidos y seguros
                    </Text>
               </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
      
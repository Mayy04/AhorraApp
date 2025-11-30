import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


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

  const cambiarContrasena = async () => {
    if (!nuevaContrasena || !confirmarContrasena) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (!validarContrasenas()) {
      if (nuevaContrasena.length < 4) {
        Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
        return;
      }
      if (nuevaContrasena !== confirmarContrasena) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }
    }

    setCargando(true);
    const resultado = await usuarioService.actualizarContrasena(correo, nuevaContrasena);
    setCargando(false);

    if (resultado.error) {
      Alert.alert("Error", resultado.error);
    } else {
      Alert.alert(
        "¡Éxito!",
        "Tu contraseña ha sido actualizada correctamente",
        [
          {
            text: "Iniciar Sesión",
            onPress: () => navigation.navigate('InicioSesion')
          }
        ]
      );
    }
  };

  const volverAlLogin = () => {
    navigation.navigate('InicioSesion');
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
                <Text style={styles.botonPrincipalTexto}>
                  {cargando ? 'VERIFICANDO...' : 'VERIFICAR IDENTIDAD'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonSecundario} onPress={volverAlLogin}>
                <Text style={styles.botonSecundarioTexto}>
                  ← Volver al inicio de sesión
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Paso 2: Nueva Contraseña */}
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
                  <Text style={styles.successText}>Las contraseñas coinciden</Text>
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
                    ← Volver a verificación
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009c5bff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: 300,
  },
  pasosContainer: {
    marginBottom: 30,
    width: '100%',
  },
  pasos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paso: {
    alignItems: 'center',
    padding: 10,
  },
  pasoNumero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    color: '#009c5bff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pasoNumeroActivo: {
    backgroundColor: '#00D162',
    color: '#fff',
  },
  pasoTexto: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
  },
  pasoTextoActivo: {
    opacity: 1,
    fontWeight: '600',
  },
  lineaPaso: {
    width: 50,
    height: 2,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  lineaPasoActiva: {
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputValido: {
    borderColor: '#00A859',
  },
  inputError: {
    borderColor: '#D62C1A',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
  },
  successText: {
    color: '#00A859',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  botonPrincipal: {
    backgroundColor: '#00D162',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonDeshabilitado: {
    backgroundColor: '#cccccc',
  },
  botonPrincipalTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonSecundario: {
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  botonSecundarioTexto: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  botonesSecundarios: {
    gap: 10,
  },
  usuarioVerificado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  usuarioInfo: {
    marginLeft: 10,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  usuarioCorreo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  requisitosContrasena: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  requisitosTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  requisito: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 4,
  },
  requisitoCumplido: {
    color: '#00D162',
    opacity: 1,
    fontWeight: '600',
  },
  infoSeguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 10,
  },
  infoSeguridadTexto: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginLeft: 5,
  },
});
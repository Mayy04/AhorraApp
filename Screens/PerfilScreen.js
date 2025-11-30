import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PerfilScreen({ route }) {
  const navigation = useNavigation();
  const usuario = route.params?.usuario || { 
    id: 1, 
    nombre: 'Usuario Demo', 
    correo: 'demo@ahorraplus.com',
    telefono: '1234567890'
  };

  const cerrarSesion = () => {
    // Navegar al inicio de sesión
    navigation.reset({
      index: 0,
      routes: [{ name: 'InicioSesion' }],
    });
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image
            source={require('../assets/logoAhorra_2.png')}
            style={styles.logo}
          />
          
          <View style={styles.profileHeader}>
            <Image
              source={require('../assets/Perfil.png')}
              style={styles.avatar}
            />
            <Text style={styles.nombre}>{usuario.nombre}</Text>
          </View>
        </View>

        {/* Cuerpo */}
        <View style={styles.main}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{usuario.correo}</Text>
            
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{usuario.telefono}</Text>
          </View>

          <Text style={styles.seccion}>Preferencias</Text>

          <View style={styles.preferenceItem}>
            <Text style={styles.prefText}>Notificaciones por correo</Text>
            <View style={styles.switchPlaceholder} />
          </View>

          <TouchableOpacity style={styles.btnCambiar}>
            <Text style={styles.btnCambiarText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCerrar} onPress={cerrarSesion}>
            <Text style={styles.btnCerrarText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.06,
  },
  logo: {
    width: 140,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007b4a',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  nombre: {
    backgroundColor: '#ffffffcc',
    color: '#007b4a',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 15,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  infoContainer: {
    width: '85%',
    backgroundColor: '#ffffffcc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 15,
  },
  seccion: {
    width: '85%',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
    color: '#007b4a',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
    backgroundColor: '#ffffffcc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  prefText: {
    fontSize: 14,
    color: '#333',
  },
  switchPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: '#00A859',
    borderRadius: 15,
  },
  btnCambiar: {
    marginTop: 20,
    marginBottom: 10,
  },
  btnCambiarText: {
    color: '#007b4a',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  btnCerrar: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnCerrarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
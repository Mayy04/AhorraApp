import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, Switch, StyleSheet, Dimensions } from 'react-native';

export default function PerfilScreen() {
  const [notificaciones, setNotificaciones] = useState(true);

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
              source={require('../assets/Perfil.png')} // Imagen temporal o tuya
              style={styles.avatar}
            />
            <Text style={styles.nombre}>Alvaro Ochoa</Text>
          </View>
        </View>

        {/* Cuerpo */}
        <View style={styles.main}>
          <Text style={styles.info}>Correo: alvaro@gmail.com</Text>
          <Text style={styles.info}>Teléfono: 44234567890</Text>

          <Text style={styles.seccion}>Preferencias</Text>

          <View style={styles.switchRow}>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              trackColor={{ false: '#ccc', true: '#007b4a' }}
              thumbColor={'#fff'}
            />
            <Text style={styles.prefText}>Notificaciones por correo activas</Text>
          </View>

          <View style={styles.btnCambiar}>
            <Text style={styles.btnCambiarText}>Cambiar contraseña</Text>
          </View>

          <View style={styles.btnCerrar}>
            <Text style={styles.btnCerrarText}>Cerrar sesión</Text>
          </View>
        </View>

        {/* Barra inferior */}
        <Image
          source={require('../assets/navbar.png')}
          style={styles.navbar}
        />
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
  },
  info: {
    fontSize: 15,
    color: '#333',
    marginVertical: 3,
    textAlign: 'left',
    width: '85%',
  },
  seccion: {
    width: '85%',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#007b4a',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '85%',
  },
  prefText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  btnCambiar: {
    marginTop: 10,
    marginBottom: 5,
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
    marginTop: 10,
  },
  btnCerrarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  navbar: {
    width: width,
    height: 65,
    resizeMode: 'contain',
  },
});
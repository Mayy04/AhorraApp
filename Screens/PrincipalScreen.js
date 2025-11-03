import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native';

export default function PrincipalScreen() {
  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image
            source={require('../assets/logoAhorra_2.jpg')}
            style={styles.logo}
          />
          <Text style={styles.saludo}>Hola, Usuario</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Saldo disponible</Text>
            <Text style={styles.balanceAmount}>$5,650.00</Text>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.main}>
          <View style={styles.row}>
            <View style={styles.option}>
              <Text style={styles.optionText}>Registrar</Text>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Análisis</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.option}>
              <Text style={styles.optionText}>Presupuestos</Text>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Metas</Text>
            </View>
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
  saludo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginTop: 10,
    marginBottom: 5,
  },
  balanceCard: {
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  balanceTitle: {
    color: '#007b4a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#007b4a',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '85%',
    marginVertical: 15,
  },
  option: {
    backgroundColor: '#ffffffdd',
    width: width * 0.35,
    height: height * 0.13,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  optionText: {
    fontSize: 14,
    color: '#007b4a',
    fontWeight: 'bold',
  },
  navbar: {
    width: width,
    height: 65,
    resizeMode: 'contain',
  },
});

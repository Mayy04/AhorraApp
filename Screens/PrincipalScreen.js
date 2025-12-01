import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Dimensions, 
  TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import TransaccionService from '../services/TransaccionService';

export default function PrincipalScreen({ navigation, route }) {
  const isFocused = useIsFocused();

  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [transaccionesRecientes, setTransaccionesRecientes] = useState([]);

  const usuario = route?.params?.usuario || { id: 1, nombre: 'Usuario' };

  const transaccionService = new TransaccionService();

  useEffect(() => {
    if (isFocused) {
      cargarDatos();
    }
  }, [isFocused]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resumenData, recientesData] = await Promise.all([
        transaccionService.obtenerResumen(usuario.id),
        transaccionService.obtenerTransaccionesRecientes(usuario.id, 3)
      ]);   
      setResumen(resumenData);
      setTransaccionesRecientes(recientesData);
    } catch (error) {
      console.log("Error cargando datos:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarDatos();
  };

  const formatearMoneda = (monto) => {
    return `$${parseFloat(monto || 0).toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}`;
  };

  const getIconoAccion = (accion) => {
    const iconos = {
      'ingreso': 'add-circle',
      'egreso': 'remove-circle',
      'analisis': 'stats-chart',
      'presupuestos': 'calendar',
      'metas': 'flag',
      'perfil': 'person'
    };
    return iconos[accion] || 'cube';
  };

  const accionesRapidas = [
    {
      id: 1,
      nombre: 'Agregar Ingreso',
      icono: 'add-circle',
      color: '#00A859',
      accion: () => navigation.navigate('Transacciones', { 
        usuario, 
        accionRapida: 'ingreso' 
      })
    },
    {
      id: 2,
      nombre: 'Agregar Gasto',
      icono: 'remove-circle',
      color: '#D62C1A',
      accion: () => navigation.navigate('Transacciones', { 
        usuario, 
        accionRapida: 'egreso' 
      })
    },
    {
      id: 3,
      nombre: 'Ver Análisis',
      icono: 'stats-chart',
      color: '#FFD600',
      accion: () => navigation.navigate('Análisis', { usuario })
    },
    {
      id: 4,
      nombre: 'Presupuestos',
      icono: 'calendar',
      color: '#9966FF',
      accion: () => navigation.navigate('Presupuestos', { usuario })
    }
  ];

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={['#00A859']}
            tintColor="#00A859"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../assets/logoAhorra_2.png')}
            style={styles.logo}
          />
          
          <Text style={styles.saludo}>Hola, {usuario.nombre}</Text>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Saldo disponible</Text>
            {cargando ? (
              <Text style={styles.balanceAmountCargando}>Cargando...</Text>
            ) : (
              <Text style={[
                styles.balanceAmount,
                resumen?.saldoActual < 0 && styles.balanceNegativo
              ]}>
                {formatearMoneda(resumen?.saldoActual)}
              </Text>
            )}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Acciones Rápidas</Text>
          <View style={styles.accionesGrid}>
            {accionesRapidas.map((accion) => (
              <TouchableOpacity
                key={accion.id}
                style={styles.accionCard}
                onPress={accion.accion}
              >
                <View style={[styles.accionIconoContainer, { backgroundColor: accion.color }]}>
                  <Ionicons name={accion.icono} size={24} color="#fff" />
                </View>
                <Text style={styles.accionTexto}>{accion.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Resumen Financiero */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Resumen del Mes</Text>
          <View style={styles.resumenGrid}>
            <View style={styles.resumenItem}>
              <Ionicons name="trending-up" size={20} color="#00A859" />
              <Text style={styles.resumenMontoIngreso}>
                +{formatearMoneda(resumen?.ingresosMes)}
              </Text>
              <Text style={styles.resumenLabel}>Ingresos</Text>
            </View>
            <View style={styles.resumenItem}>
              <Ionicons name="trending-down" size={20} color="#D62C1A" />
              <Text style={styles.resumenMontoEgreso}>
                -{formatearMoneda(resumen?.gastosMes)}
              </Text>
              <Text style={styles.resumenLabel}>Gastos</Text>
            </View>
            <View style={styles.resumenItem}>
              <Ionicons name="wallet" size={20} color="#FFD600" />
              <Text style={[
                styles.resumenMontoAhorro,
                resumen?.ahorroMes < 0 && styles.ahorroNegativo
              ]}>
                {resumen?.ahorroMes >= 0 ? '+' : ''}{formatearMoneda(resumen?.ahorroMes)}
              </Text>
              <Text style={styles.resumenLabel}>Ahorro</Text>
            </View>
          </View>
        </View>

        {/* Transacciones Recientes */}
        {transaccionesRecientes.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Transacciones Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transacciones', { usuario })}>
                <Text style={styles.verTodoTexto}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transaccionesLista}>
              {transaccionesRecientes.map((transaccion) => (
                <View key={transaccion.id} style={styles.transaccionItem}>
                  <View style={styles.transaccionInfo}>
                    <Ionicons 
                      name={transaccion.tipo === 'ingreso' ? 'add-circle' : 'remove-circle'} 
                      size={20} 
                      color={transaccion.tipo === 'ingreso' ? '#00A859' : '#D62C1A'} 
                    />
                    <View style={styles.transaccionDetalles}>
                      <Text style={styles.transaccionCategoria}>{transaccion.categoria}</Text>
                      <Text style={styles.transaccionFecha}>
                        {formatearFecha(transaccion.fecha)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transaccionMonto,
                    transaccion.tipo === 'ingreso' ? styles.ingreso : styles.egreso
                  ]}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(transaccion.monto)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.espacioFinal} />
      </ScrollView>
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
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingBottom: 20,
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
    color: '#fff',
    marginTop: 10,
    marginBottom: 15,
  },
  balanceCard: {
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  balanceTitle: {
    color: '#007b4a',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007b4a',
  },
  balanceAmountCargando: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  balanceNegativo: {
    color: '#D62C1A',
  },
  seccion: {
    backgroundColor: '#ffffffcc',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007b4a',
  },
  verTodoTexto: {
    color: '#00A859',
    fontWeight: '600',
    fontSize: 14,
  },
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  accionIconoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accionTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  resumenGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  resumenMontoIngreso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A859',
    marginVertical: 5,
  },
  resumenMontoEgreso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D62C1A',
    marginVertical: 5,
  },
  resumenMontoAhorro: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD600',
    marginVertical: 5,
  },
  ahorroNegativo: {
    color: '#D62C1A',
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transaccionesLista: {
    marginTop: 10,
  },
  transaccionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transaccionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transaccionDetalles: {
    marginLeft: 10,
  },
  transaccionCategoria: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transaccionFecha: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transaccionMonto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ingreso: {
    color: '#00A859',
  },
  egreso: {
    color: '#D62C1A',
  },
  espacioFinal: {
    height: 30,
  },
});
import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, Image, ImageBackground, Dimensions, ScrollView, ActivityIndicator} from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { PieChart, BarChart } from "react-native-chart-kit";
import TransaccionService from "../Services/TransaccionService";

const { width, height } = Dimensions.get("window");

export default function AnalisisScreen({ route }) {
  const isFocused = useIsFocused();
  const usuario = route.params?.usuario || { id: 1 };
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState(null);

  const transaccionService = new TransaccionService();

  useEffect(() => {
    if(isFocused){
    cargarDatosAnalisis();
    }
  }, [isFocused]);

  const cargarDatosAnalisis = async () => {
    setCargando(true);
    
    const resumenData = await transaccionService.obtenerResumen(usuario.id);
    setResumen(resumenData);

    const transacciones = await transaccionService.obtenerTransacciones(usuario.id, 'todos');
    
    if (transacciones.ok) {
      procesarDatos(transacciones.transacciones);
    }
    
    setCargando(false);
  };

  const procesarDatos = (transacciones) => {
    const gastosPorCategoria = {};
    const ingresosPorMes = {};
    const gastosPorMes = {};

    transacciones.forEach(transaccion => {
      const mes = transaccion.fecha.substring(0, 7); 
      
      if (transaccion.tipo === 'egreso') {
        gastosPorCategoria[transaccion.categoria] = 
          (gastosPorCategoria[transaccion.categoria] || 0) + transaccion.monto;
        
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + transaccion.monto;
      } else {
 
        ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + transaccion.monto;
      }
    });

    // Preparar datos para gráfica de categorías
    const datosCategorias = Object.entries(gastosPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([categoria, monto], index) => ({
        name: categoria,
        amount: monto,
        color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      }));

    // Preparar datos para gráfica de tendencias
    const todosLosMeses = [...new Set([
      ...Object.keys(ingresosPorMes),
      ...Object.keys(gastosPorMes)
    ])].sort().slice(-6);

    const datosTendencias = {
      labels: todosLosMeses.map(mes => {
        const [year, month] = mes.split('-');
        return `${month}/${year.substring(2)}`;
      }),
      datasets: [
        {
          data: todosLosMeses.map(mes => ingresosPorMes[mes] || 0),
        },
        {
          data: todosLosMeses.map(mes => gastosPorMes[mes] || 0),
        }
      ]
    };

    setDatos({
      categorias: datosCategorias,
      tendencias: datosTendencias
    });
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#128354" />
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/fondo.png")}
        style={styles.headerBackground}
        resizeMode="stretch"
      >
        <View style={styles.headerOverlay}>
          <Image
            source={require("../assets/logoAhorra_2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Análisis</Text>
        </View>
      </ImageBackground>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumen Financiero */}
        <View style={styles.resumenContainer}>
          <Text style={styles.seccionTitulo}>Resumen Financiero</Text>
          <View style={styles.resumenGrid}>
            <View style={styles.resumenCard}>
              <Text style={styles.resumenValor}>${resumen?.saldoActual?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.resumenLabel}>Saldo Total</Text>
            </View>
            <View style={styles.resumenCard}>
              <Text style={[styles.resumenValor, styles.ingreso]}>+${resumen?.ingresosMes?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.resumenLabel}>Ingresos</Text>
            </View>
            <View style={styles.resumenCard}>
              <Text style={[styles.resumenValor, styles.egreso]}>-${resumen?.gastosMes?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.resumenLabel}>Gastos</Text>
            </View>
            <View style={styles.resumenCard}>
              <Text style={[styles.resumenValor, styles.ahorro]}>${resumen?.ahorroMes?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.resumenLabel}>Ahorro</Text>
            </View>
          </View>
        </View>

        {/* Gráfica de Gastos por Categoría */}
        {datos?.categorias.length > 0 && (
          <View style={styles.graficaContainer}>
            <Text style={styles.seccionTitulo}>Gastos por Categoría</Text>
            <PieChart
              data={datos.categorias}
              width={width * 0.9}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Gráfica de Tendencias */}
        {datos?.tendencias && (
          <View style={styles.graficaContainer}>
            <Text style={styles.seccionTitulo}>Tendencias Mensuales</Text>
            <BarChart
              data={datos.tendencias}
              width={width * 0.9}
              height={220}
              chartConfig={chartConfig}
              style={styles.grafica}
              showValuesOnTopOfBars
            />
          </View>
        )}

        {(!datos?.categorias.length && !datos?.tendencias) && (
          <View style={styles.sinDatosContainer}>
            <Text style={styles.sinDatosText}>No hay datos para mostrar</Text>
            <Text style={styles.sinDatosSubtext}>Agrega transacciones para ver análisis</Text>
          </View>
        )}

        <View style={styles.espacioFinal} />
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    color: '#128354',
    fontSize: 16
  },
  headerBackground: {
    height: height * 0.40,
  },
  headerOverlay: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 20,
  },
  logo: {
    width: width * 0.35,
    height: height * 0.08,
    marginBottom: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    marginTop: -210,
  },
  resumenContainer: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#128354',
    marginBottom: 15,
    textAlign: 'center'
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resumenCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  resumenValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ingreso: {
    color: '#00A859',
  },
  egreso: {
    color: '#D62C1A',
  },
  ahorro: {
    color: '#FFD600',
  },
  graficaContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  grafica: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sinDatosContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  sinDatosText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  sinDatosSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  espacioFinal: {
    height: 30,
  },
});
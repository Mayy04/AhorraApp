import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, Image, ImageBackground, Dimensions, ScrollView, ActivityIndicator} from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { PieChart, BarChart } from "react-native-chart-kit";
import TransaccionService from "../services/TransaccionService";

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
    
    try {
      const [resumenData, transaccionesData] = await Promise.all([
        transaccionService.obtenerResumen(usuario.id),
        transaccionService.obtenerTransacciones(usuario.id, 'todos')
      ]);
      
      setResumen(resumenData);
      
      if (transaccionesData.ok) {
        procesarDatos(transaccionesData.transacciones);
      } else {
        setDatos(null);
      }
    } catch (error) {
      console.log("Error cargando análisis:", error);
      setDatos(null);
    } finally {
      setCargando(false);
    }
  };

  const procesarDatos = (transacciones) => {
    const gastosPorCategoria = {};
    const ingresosPorMes = {};
    const gastosPorMes = {};

    // Procesar últimos 6 meses
    const ultimos6Meses = [];
    const hoy = new Date();
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesStr = mes.toISOString().substring(0, 7);
      ultimos6Meses.push(mesStr);
      ingresosPorMes[mesStr] = 0;
      gastosPorMes[mesStr] = 0;
    }

    transacciones.forEach(transaccion => {
      const mes = transaccion.fecha.substring(0, 7); 
      
      if (transaccion.tipo === 'egreso') {
        // Gastos por categoría
        gastosPorCategoria[transaccion.categoria] = 
          (gastosPorCategoria[transaccion.categoria] || 0) + transaccion.monto;
        
        // Gastos por mes (últimos 6 meses)
        if (ultimos6Meses.includes(mes)) {
          gastosPorMes[mes] = (gastosPorMes[mes] || 0) + transaccion.monto;
        }
      } else {
        // Ingresos por mes (últimos 6 meses)
        if (ultimos6Meses.includes(mes)) {
          ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + transaccion.monto;
        }
      }
    });

    // Datos para gráfica de categorías
    const datosCategorias = Object.entries(gastosPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([categoria, monto], index) => ({
        name: categoria.length > 10 ? categoria.substring(0, 10) + '...' : categoria,
        amount: monto,
        color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      }));

    // Preparar datos para gráfica de tendencias
    const datosTendencias = {
      labels: ultimos6Meses.map(mes => {
        const [year, month] = mes.split('-');
        return `${month}/${year.substring(2)}`;
      }),
      datasets: [
        {
          data: ultimos6Meses.map(mes => ingresosPorMes[mes] || 0),
          color: (opacity = 1) => `rgba(0, 168, 89, ${opacity})`,
        },
        {
          data: ultimos6Meses.map(mes => gastosPorMes[mes] || 0),
          color: (opacity = 1) => `rgba(214, 44, 26, ${opacity})`,
        }
      ]
    };

    setDatos({
      categorias: datosCategorias,
      tendencias: datosTendencias,
      totalGastos: Object.values(gastosPorCategoria).reduce((sum, val) => sum + val, 0),
      totalIngresos: Object.values(ingresosPorMes).reduce((sum, val) => sum + val, 0)
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
            <Text style={styles.graficaSubtitulo}>Últimos 6 meses</Text>
            <BarChart
              data={datos.tendencias}
              width={width * 0.9}
              height={220}
              chartConfig={chartConfigBar}
              style={styles.grafica}
              showValuesOnTopOfBars
            />
            <View style={styles.leyenda}>
              <View style={styles.leyendaItem}>
                <View style={[styles.leyendaColor, {backgroundColor: '#00A859'}]} />
                <Text style={styles.leyendaTexto}>Ingresos</Text>
              </View>
              <View style={styles.leyendaItem}>
                <View style={[styles.leyendaColor, {backgroundColor: '#D62C1A'}]} />
                <Text style={styles.leyendaTexto}>Gastos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Estadísticas Generales */}
        {datos && (
          <View style={styles.estadisticasContainer}>
            <Text style={styles.seccionTitulo}>Estadísticas</Text>
            <View style={styles.estadisticasGrid}>
              <View style={styles.estadisticaItem}>
                <Text style={styles.estadisticaValor}>${datos.totalIngresos.toFixed(2)}</Text>
                <Text style={styles.estadisticaLabel}>Total Ingresos</Text>
              </View>
              <View style={styles.estadisticaItem}>
                <Text style={styles.estadisticaValor}>${datos.totalGastos.toFixed(2)}</Text>
                <Text style={styles.estadisticaLabel}>Total Gastos</Text>
              </View>
              <View style={styles.estadisticaItem}>
                <Text style={styles.estadisticaValor}>
                  {datos.totalIngresos > 0 ? ((datos.totalGastos / datos.totalIngresos) * 100).toFixed(1) : '0'}%
                </Text>
                <Text style={styles.estadisticaLabel}>% Gastos/Ingresos</Text>
              </View>
            </View>
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

const chartConfigBar = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  barPercentage: 0.5,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#e3e3e3'
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
    alignItems: 'center'
  },
  graficaSubtitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  grafica: {
    marginVertical: 8,
    borderRadius: 16,
  },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  leyendaTexto: {
    fontSize: 12,
    color: '#666'
  },
  estadisticasContainer: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estadisticaItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  estadisticaValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  estadisticaLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
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
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Dimensions,
  TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransaccionService from '../services/TransaccionService';
import styles from '../styles/presupuestos';

const { width, height } = Dimensions.get('window');

export default function PresupuestosScreen({ route }) {
  const usuario = route.params?.usuario || { id: 1, nombre: 'Usuario' };
  const [presupuestos, setPresupuestos] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [presupuestoEditando, setPresupuestoEditando] = useState(null);
  const [form, setForm] = useState({
    categoria: '',
    monto: '',
    periodo: 'mensual'
  });

  const transaccionService = new TransaccionService();

  // Presupuestos predefinidos por categoría
  const presupuestosIniciales = [
    { id: 1, categoria: 'Comida', monto: 2000, periodo: 'mensual', gastoActual: 0 },
    { id: 2, categoria: 'Transporte', monto: 1000, periodo: 'mensual', gastoActual: 0 },
    { id: 3, categoria: 'Entretenimiento', monto: 500, periodo: 'mensual', gastoActual: 0 },
    { id: 4, categoria: 'Servicios', monto: 1500, periodo: 'mensual', gastoActual: 0 },
    { id: 5, categoria: 'Salud', monto: 800, periodo: 'mensual', gastoActual: 0 },
  ];

  useEffect(() => {
    cargarDatosPresupuestos();
  }, []);

  const cargarDatosPresupuestos = async () => {
    try {
      // Obtener gastos por categoría del mes actual
      const transacciones = await transaccionService.obtenerTransacciones(usuario.id, 'egreso');
      
      if (transacciones.ok) {
        const gastos = calcularGastosPorCategoria(transacciones.transacciones);
        setGastosPorCategoria(gastos);
        
        // Combinar con presupuestos
        const presupuestosActualizados = presupuestosIniciales.map(presupuesto => {
          const gasto = gastos.find(g => g.categoria === presupuesto.categoria);
          return {
            ...presupuesto,
            gastoActual: gasto ? gasto.total : 0,
            porcentaje: gasto ? (gasto.total / presupuesto.monto) * 100 : 0
          };
        });
        
        setPresupuestos(presupuestosActualizados);
      }
    } catch (error) {
      console.log("Error cargando presupuestos:", error);
      setPresupuestos(presupuestosIniciales);
    }
  };

  const calcularGastosPorCategoria = (transacciones) => {
    const gastos = {};
    const mesActual = new Date().toISOString().substring(0, 7);
    
    transacciones.forEach(transaccion => {
      if (transaccion.fecha.startsWith(mesActual)) {
        gastos[transaccion.categoria] = (gastos[transaccion.categoria] || 0) + transaccion.monto;
      }
    });

    return Object.entries(gastos).map(([categoria, total]) => ({
      categoria,
      total
    }));
  };

  const guardarPresupuesto = () => {
    if (!form.categoria || !form.monto) {
      Alert.alert("Error", "Completa todos los campos requeridos");
      return;
    }

    const montoNum = parseFloat(form.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser un número válido mayor a 0");
      return;
    }

    if (presupuestoEditando) {
      // Actualizar presupuesto existente
      const presupuestosActualizados = presupuestos.map(p =>
        p.id === presupuestoEditando.id
          ? { ...p, categoria: form.categoria, monto: montoNum, periodo: form.periodo }
          : p
      );
      setPresupuestos(presupuestosActualizados);
    } else {
      // Crear nuevo presupuesto
      const nuevoPresupuesto = {
        id: Date.now(),
        categoria: form.categoria,
        monto: montoNum,
        periodo: form.periodo,
        gastoActual: 0,
        porcentaje: 0
      };
      setPresupuestos([...presupuestos, nuevoPresupuesto]);
    }

    setModalVisible(false);
    limpiarForm();
    Alert.alert("Éxito", presupuestoEditando ? "Presupuesto actualizado" : "Presupuesto creado");
  };

  const eliminarPresupuesto = (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este presupuesto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setPresupuestos(presupuestos.filter(p => p.id !== id));
          }
        }
      ]
    );
  };

  const abrirModal = (presupuesto = null) => {
    if (presupuesto) {
      setPresupuestoEditando(presupuesto);
      setForm({
        categoria: presupuesto.categoria,
        monto: presupuesto.monto.toString(),
        periodo: presupuesto.periodo
      });
    } else {
      setPresupuestoEditando(null);
      setForm({
        categoria: '',
        monto: '',
        periodo: 'mensual'
      });
    }
    setModalVisible(true);
  };

  const limpiarForm = () => {
    setForm({
      categoria: '',
      monto: '',
      periodo: 'mensual'
    });
    setPresupuestoEditando(null);
  };

  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje < 60) return '#00A859';
    if (porcentaje < 80) return '#FFD600';
    return '#D62C1A';
  };

  const getEstadoPresupuesto = (porcentaje) => {
    if (porcentaje < 60) return 'Dentro del presupuesto';
    if (porcentaje < 80) return 'Cerca del límite';
    return 'Excedido';
  };

  const formatearMoneda = (monto) => {
    return `$${parseFloat(monto || 0).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>Presupuestos</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {/* Resumen de Presupuestos */}
        <View style={styles.resumenContainer}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>{presupuestos.length}</Text>
            <Text style={styles.resumenLabel}>Presupuestos</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>
              {presupuestos.filter(p => p.porcentaje < 80).length}
            </Text>
            <Text style={styles.resumenLabel}>En control</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>
              {presupuestos.filter(p => p.porcentaje >= 80).length}
            </Text>
            <Text style={styles.resumenLabel}>Por exceder</Text>
          </View>
        </View>

        {/* Lista de Presupuestos */}
        <FlatList
          data={presupuestos}
          keyExtractor={(item) => item.id.toString()}
          style={styles.lista}
          contentContainerStyle={presupuestos.length === 0 && styles.listaVaciaContainer}
          renderItem={({ item }) => (
            <View style={styles.presupuestoCard}>
              <View style={styles.presupuestoHeader}>
                <View style={styles.presupuestoInfo}>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                  <Text style={styles.periodo}>{item.periodo}</Text>
                </View>
                <View style={styles.presupuestoAcciones}>
                  <TouchableOpacity 
                    style={styles.botonAccion}
                    onPress={() => abrirModal(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#007b4a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.botonAccion}
                    onPress={() => eliminarPresupuesto(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#D62C1A" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Barra de progreso */}
              <View style={styles.barraProgresoContainer}>
                <View style={styles.barraProgresoLabels}>
                  <Text style={styles.montoLabel}>
                    Gastado: {formatearMoneda(item.gastoActual)}
                  </Text>
                  <Text style={styles.montoLabel}>
                    Presupuesto: {formatearMoneda(item.monto)}
                  </Text>
                </View>
                <View style={styles.barraProgreso}>
                  <View 
                    style={[
                      styles.barraProgresoFill,
                      { 
                        width: `${Math.min(item.porcentaje, 100)}%`,
                        backgroundColor: getColorPorcentaje(item.porcentaje)
                      }
                    ]} 
                  />
                </View>
                <View style={styles.barraProgresoInfo}>
                  <Text style={styles.porcentaje}>
                    {item.porcentaje.toFixed(1)}%
                  </Text>
                  <Text style={[
                    styles.estado,
                    { color: getColorPorcentaje(item.porcentaje) }
                  ]}>
                    {getEstadoPresupuesto(item.porcentaje)}
                  </Text>
                </View>
              </View>

              {/* Información adicional */}
              {item.porcentaje > 0 && (
                <View style={styles.infoAdicional}>
                  <Text style={styles.infoText}>
                    Restante: {formatearMoneda(item.monto - item.gastoActual)}
                  </Text>
                  {item.porcentaje >= 80 && (
                    <Text style={styles.alertaText}>
                      {item.porcentaje >= 100 ? 'Presupuesto excedido' : 'Cerca del límite'}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listaVacia}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.textoListaVacia}>No hay presupuestos configurados</Text>
              <Text style={styles.subtextoListaVacia}>
                Crea tu primer presupuesto para comenzar a controlar tus gastos
              </Text>
            </View>
          }
        />
      </View>

      {/* Botón flotante para agregar presupuesto */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => abrirModal()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar/editar presupuesto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {presupuestoEditando ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.botonCerrar}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Comida, Transporte, etc."
                  value={form.categoria}
                  onChangeText={(text) => setForm({...form, categoria: text})}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto del presupuesto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 1000.00"
                  value={form.monto}
                  onChangeText={(text) => setForm({...form, monto: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Período */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Período</Text>
                <View style={styles.periodoContainer}>
                  {['mensual', 'quincenal', 'semanal'].map((periodo) => (
                    <TouchableOpacity
                      key={periodo}
                      style={[
                        styles.periodoButton,
                        form.periodo === periodo && styles.periodoButtonActive
                      ]}
                      onPress={() => setForm({...form, periodo})}
                    >
                      <Text style={[
                        styles.periodoButtonText,
                        form.periodo === periodo && styles.periodoButtonTextActive
                      ]}>
                        {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Botones de acción */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.botonCancelar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.botonGuardar}
                  onPress={guardarPresupuesto}
                >
                  <Text style={styles.botonGuardarTexto}>
                    {presupuestoEditando ? 'ACTUALIZAR' : 'CREAR'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
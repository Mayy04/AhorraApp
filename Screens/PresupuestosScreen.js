import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Image, ImageBackground, Dimensions,TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransaccionService from '../Services/TransaccionService';

const { width, height } = Dimensions.get('window');

export default function PresupuestosScreen({ route }) {
  const usuario = route.params?.usuario || { id: 1, nombre: 'Usuario' };
  const [presupuestos, setPresupuestos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [presupuestoEditando, setPresupuestoEditando] = useState(null);
  const [form, setForm] = useState({
    categoria: '',
    monto: '',
    periodo: 'mensual'
  });

  const transaccionService = new TransaccionService();

  useEffect(() => {
    cargarDatosPresupuestos();
  }, []);

  const cargarDatosPresupuestos = async () => {
    try {
      // Obtener gastos por categoría del mes actual
      const transacciones = await transaccionService.obtenerTransacciones(usuario.id, 'egreso');
      
      if (transacciones.ok) {
        const gastos = calcularGastosPorCategoria(transacciones.transacciones);
        
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  headerBackground: {
    position: "absolute",
    top:0,
    left: 0,
    right:0,
    height: height * 0.40,
    zIndex: 0,
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
  content: {
    flex: 1,
    marginTop: -18,
  },
  resumenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    marginHorizontal: 15,
    marginTop: 160,
    borderRadius: 12,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007b4a',
    marginBottom: 5,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
  },
  lista: {
    flex: 1,
    marginTop: 10,
  },
  listaVaciaContainer: {
    flex: 1,
  },
  presupuestoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  presupuestoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  presupuestoInfo: {
    flex: 1,
  },
  categoria: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  periodo: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  presupuestoAcciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAccion: {
    padding: 6,
  },
  barraProgresoContainer: {
    marginBottom: 10,
  },
  barraProgresoLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  montoLabel: {
    fontSize: 12,
    color: '#666',
  },
  barraProgreso: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresoFill: {
    height: '100%',
    borderRadius: 4,
  },
  barraProgresoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  porcentaje: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  estado: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoAdicional: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  alertaText: {
    fontSize: 11,
    color: '#D62C1A',
    fontWeight: '600',
  },
  listaVacia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  textoListaVacia: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtextoListaVacia: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#00A859",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botonCerrar: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  periodoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  periodoButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  periodoButtonActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859',
  },
  periodoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodoButtonTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  botonCancelar: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  botonGuardar: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00A859',
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
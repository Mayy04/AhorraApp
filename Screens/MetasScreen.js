import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Image, ImageBackground, Dimensions,TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MetaService from '../Services/metaService';

const { width, height } = Dimensions.get('window');

export default function MetasScreen({ route }) {
  const usuario = route.params?.usuario || { id: 1, nombre: 'Usuario' };
  const [metas, setMetas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [metaEditando, setMetaEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    total_metas: 0,
    metas_completadas: 0,
    total_ahorrado: 0,
    total_objetivo: 0,
    porcentajeTotal: 0
  });
  
  const [form, setForm] = useState({
    nombre: '',
    montoObjetivo: '',
    montoActual: '',
    fechaObjetivo: '',
    categoria: '',
    descripcion: ''
  });

  const metaService = new MetaService();

  const categorias = ['Viajes', 'Tecnología', 'Educación', 'Salud', 'Hogar', 'Automóvil', 'Ahorro', 'Otros'];

  useEffect(() => {
    cargarMetas();
  }, []);

  const cargarMetas = async () => {
    setCargando(true);
    try {
      const [resultadoMetas, resultadoEstadisticas] = await Promise.all([
        metaService.obtenerMetas(usuario.id),
        metaService.obtenerEstadisticas(usuario.id)
      ]);
      
      if (resultadoMetas.ok) {
        setMetas(resultadoMetas.metas);
      } else {
        // Si no hay metas, migrar algunas de ejemplo
        await metaService.migrarMetasEjemplo(usuario.id);
        const resultadoNuevo = await metaService.obtenerMetas(usuario.id);
        if (resultadoNuevo.ok) {
          setMetas(resultadoNuevo.metas);
        }
      }
      
      setEstadisticas(resultadoEstadisticas);
    } catch (error) {
      console.log("Error cargando metas:", error);
      Alert.alert("Error", "No se pudieron cargar las metas");
    } finally {
      setCargando(false);
    }
  };

  const calcularDiasRestantes = (fechaObjetivo) => {
    const hoy = new Date();
    const objetivo = new Date(fechaObjetivo);
    const diferencia = objetivo.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const guardarMeta = async () => {
    if (!form.nombre || !form.montoObjetivo || !form.fechaObjetivo || !form.categoria) {
      Alert.alert("Error", "Completa los campos requeridos");
      return;
    }

    const montoObjetivo = parseFloat(form.montoObjetivo);
    const montoActual = parseFloat(form.montoActual) || 0;

    if (isNaN(montoObjetivo) || montoObjetivo <= 0) {
      Alert.alert("Error", "El monto objetivo debe ser mayor a 0");
      return;
    }

    if (montoActual > montoObjetivo) {
      Alert.alert("Error", "El monto actual no puede ser mayor al objetivo");
      return;
    }

    // Validar fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(form.fechaObjetivo)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return;
    }

    try {
      let resultado;
      if (metaEditando) {
        resultado = await metaService.actualizarMeta(
          metaEditando.id,
          form.nombre,
          montoObjetivo,
          montoActual,
          form.fechaObjetivo,
          form.categoria,
          form.descripcion
        );
      } else {
        resultado = await metaService.crearMeta(
          usuario.id,
          form.nombre,
          montoObjetivo,
          montoActual,
          form.fechaObjetivo,
          form.categoria,
          form.descripcion
        );
      }

      if (resultado.error) {
        Alert.alert("Error", resultado.error);
      } else {
        setModalVisible(false);
        limpiarForm();
        // Recargar datos desde la base de datos
        await cargarMetas(); 
        Alert.alert("Éxito", resultado.mensaje);
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al guardar la meta");
    }
  };

  const agregarAhorro = async (meta, monto) => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "Ingresa un monto válido mayor a 0");
      return;
    }

    try {
      const resultado = await metaService.agregarAhorro(meta.id, montoNum, usuario.id);
      
      if (resultado.error) {
        Alert.alert("Error", resultado.error);
      } else {
         // Recargar datos desde la base de datos
        await cargarMetas();
        Alert.alert("Éxito", resultado.mensaje);
      }
    } catch (error) {
      Alert.alert("Error", "Error al agregar ahorro");
    }
  };

  const eliminarMeta = async (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar esta meta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const resultado = await metaService.eliminarMeta(id);
              
              if (resultado.error) {
                Alert.alert("Error", resultado.error);
              } else {
                // Recargar datos desde la base de datos
                await cargarMetas(); 
                Alert.alert("Éxito", resultado.mensaje);
              }
            } catch (error) {
              Alert.alert("Error", "Error al eliminar la meta");
            }
          }
        }
      ]
    );
  };

  const abrirModal = (meta = null) => {
    if (meta) {
      setMetaEditando(meta);
      setForm({
        nombre: meta.nombre,
        montoObjetivo: meta.monto_objetivo.toString(),
        montoActual: meta.monto_actual.toString(),
        fechaObjetivo: meta.fecha_objetivo,
        categoria: meta.categoria,
        descripcion: meta.descripcion || ''
      });
    } else {
      setMetaEditando(null);
      setForm({
        nombre: '',
        montoObjetivo: '',
        montoActual: '',
        fechaObjetivo: '',
        categoria: '',
        descripcion: ''
      });
    }
    setModalVisible(true);
  };

  const abrirModalAhorro = (meta) => {
    Alert.prompt(
      `Agregar ahorro a "${meta.nombre}"`,
      `Monto actual: ${formatearMoneda(meta.monto_actual)}\nMonto objetivo: ${formatearMoneda(meta.monto_objetivo)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: (monto) => agregarAhorro(meta, monto)
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const limpiarForm = () => {
    setForm({
      nombre: '',
      montoObjetivo: '',
      montoActual: '',
      fechaObjetivo: '',
      categoria: '',
      descripcion: ''
    });
    setMetaEditando(null);
  };

  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje < 25) return '#D62C1A';
    if (porcentaje < 50) return '#FFD600';
    if (porcentaje < 75) return '#36A2EB';
    return '#00A859';
  };

  const getEstadoMeta = (meta) => {
    if (meta.completada) return '¡Completada! 🎉';
    if (meta.diasRestantes < 0) return 'Tiempo agotado';
    if (meta.porcentaje >= 75) return 'Casi lista';
    if (meta.porcentaje >= 50) return 'En progreso';
    if (meta.porcentaje >= 25) return 'Comenzando';
    return 'Iniciando';
  };

  const formatearMoneda = (monto) => {
    return `$${parseFloat(monto || 0).toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="flag" size={50} color="#00A859" />
        <Text style={styles.loadingText}>Cargando metas...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Metas de Ahorro</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {/* Resumen de Metas */}
        <View style={styles.resumenContainer}>
          <View style={styles.resumenItem}>
            <Ionicons name="trophy" size={24} color="#FFD600" />
            <Text style={styles.resumenNumero}>{estadisticas.metas_completadas}</Text>
            <Text style={styles.resumenLabel}>Completadas</Text>
          </View>
          <View style={styles.resumenItem}>
            <Ionicons name="flag" size={24} color="#36A2EB" />
            <Text style={styles.resumenNumero}>{estadisticas.total_metas}</Text>
            <Text style={styles.resumenLabel}>Total Metas</Text>
          </View>
          <View style={styles.resumenItem}>
            <Ionicons name="wallet" size={24} color="#00A859" />
            <Text style={styles.resumenNumero}>{formatearMoneda(estadisticas.total_ahorrado)}</Text>
            <Text style={styles.resumenLabel}>Total Ahorrado</Text>
          </View>
        </View>

        {/* Barra de progreso general */}
        <View style={styles.progresoGeneralContainer}>
          <Text style={styles.progresoGeneralTitulo}>Progreso General</Text>
          <View style={styles.barraProgresoGeneral}>
            <View 
              style={[
                styles.barraProgresoFillGeneral,
                { width: `${Math.min(estadisticas.porcentajeTotal, 100)}%` }
              ]} 
            />
          </View>
          <View style={styles.progresoGeneralInfo}>
            <Text style={styles.progresoGeneralTexto}>
              {formatearMoneda(estadisticas.total_ahorrado)} de {formatearMoneda(estadisticas.total_objetivo)}
            </Text>
            <Text style={styles.progresoGeneralPorcentaje}>
              {estadisticas.porcentajeTotal.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Lista de Metas */}
        <FlatList
          data={metas}
          keyExtractor={(item) => item.id.toString()}
          style={styles.lista}
          contentContainerStyle={metas.length === 0 && styles.listaVaciaContainer}
          renderItem={({ item }) => (
            <View style={[
              styles.metaCard,
              item.completada && styles.metaCardCompletada
            ]}>
              {/* Header de la meta */}
              <View style={styles.metaHeader}>
                <View style={styles.metaInfo}>
                  <Text style={styles.metaNombre}>{item.nombre}</Text>
                  <View style={styles.metaCategoriaContainer}>
                    <Text style={styles.metaCategoria}>{item.categoria}</Text>
                    {item.completada && (
                      <View style={styles.badgeCompletada}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                        <Text style={styles.badgeTexto}>Completada</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.metaAcciones}>
                  <TouchableOpacity 
                    style={styles.botonAccion}
                    onPress={() => abrirModalAhorro(item)}
                  >
                    <Ionicons name="add-circle" size={20} color="#00A859" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.botonAccion}
                    onPress={() => abrirModal(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#007b4a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.botonAccion}
                    onPress={() => eliminarMeta(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#D62C1A" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Descripción */}
              {item.descripcion ? (
                <Text style={styles.metaDescripcion}>{item.descripcion}</Text>
              ) : null}

              {/* Barra de progreso */}
              <View style={styles.barraProgresoContainer}>
                <View style={styles.barraProgresoLabels}>
                  <Text style={styles.montoLabel}>
                    Ahorrado: {formatearMoneda(item.monto_actual)}
                  </Text>
                  <Text style={styles.montoLabel}>
                    Objetivo: {formatearMoneda(item.monto_objetivo)}
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
                  <Text style={styles.estado}>
                    {getEstadoMeta(item)}
                  </Text>
                </View>
              </View>

              {/* Información adicional */}
              <View style={styles.metaInfoAdicional}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={14} color="#666" />
                  <Text style={styles.infoText}>
                    Objetivo: {formatearFecha(item.fecha_objetivo)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={14} color="#666" />
                  <Text style={[
                    styles.infoText,
                    item.diasRestantes < 0 && styles.tiempoAgotado
                  ]}>
                    {item.diasRestantes >= 0 
                      ? `${item.diasRestantes} días restantes`
                      : 'Tiempo agotado'
                    }
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="cash" size={14} color="#666" />
                  <Text style={styles.infoText}>
                    Restante: {formatearMoneda(item.monto_objetivo - item.monto_actual)}
                  </Text>
                </View>
              </View>

              {/* Botón de acción rápida */}
              {!item.completada && (
                <TouchableOpacity 
                  style={styles.botonAhorroRapido}
                  onPress={() => abrirModalAhorro(item)}
                >
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <Text style={styles.botonAhorroRapidoTexto}>Agregar Ahorro</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listaVacia}>
              <Ionicons name="flag-outline" size={60} color="#ccc" />
              <Text style={styles.textoListaVacia}>No hay metas configuradas</Text>
              <Text style={styles.subtextoListaVacia}>
                Crea tu primera meta de ahorro para comenzar
              </Text>
              <TouchableOpacity 
                style={styles.botonCrearPrimeraMeta}
                onPress={() => abrirModal()}
              >
                <Text style={styles.botonCrearPrimeraMetaTexto}>Crear Primera Meta</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Botón flotante para agregar meta */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => abrirModal()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar/editar meta */}
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
                {metaEditando ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.botonCerrar}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de la meta *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Viaje a la playa, Laptop nueva..."
                  value={form.nombre}
                  onChangeText={(text) => setForm({...form, nombre: text})}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Monto objetivo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto objetivo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 10000.00"
                  value={form.montoObjetivo}
                  onChangeText={(text) => setForm({...form, montoObjetivo: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Monto actual */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto actual ahorrado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 0.00"
                  value={form.montoActual}
                  onChangeText={(text) => setForm({...form, montoActual: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Fecha objetivo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha objetivo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={form.fechaObjetivo}
                  onChangeText={(text) => setForm({...form, fechaObjetivo: text})}
                  placeholderTextColor="#999"
                />
                <Text style={styles.helperText}>
                  Formato: Año-Mes-Día (Ej: 2024-12-31)
                </Text>
              </View>

              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriasContainer}
                >
                  {categorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      style={[
                        styles.categoriaButton,
                        form.categoria === categoria && styles.categoriaButtonActive
                      ]}
                      onPress={() => setForm({...form, categoria})}
                    >
                      <Text style={[
                        styles.categoriaButtonText,
                        form.categoria === categoria && styles.categoriaButtonTextActive
                      ]}>
                        {categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe tu meta..."
                  value={form.descripcion}
                  onChangeText={(text) => setForm({...form, descripcion: text})}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
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
                  onPress={guardarMeta}
                >
                  <Text style={styles.botonGuardarTexto}>
                    {metaEditando ? 'ACTUALIZAR' : 'CREAR META'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    color: '#00A859',
    fontSize: 16
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    marginTop: height * 0.18,
    zIndex: 1,
  },
  resumenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007b4a',
    marginVertical: 5,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
  },
  progresoGeneralContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  progresoGeneralTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  barraProgresoGeneral: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barraProgresoFillGeneral: {
    height: '100%',
    backgroundColor: '#00A859',
    borderRadius: 5,
  },
  progresoGeneralInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progresoGeneralTexto: {
    fontSize: 14,
    color: '#666',
  },
  progresoGeneralPorcentaje: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007b4a',
  },
  lista: {
    flex: 1,
    marginTop: 10,
  },
  listaVaciaContainer: {
    flex: 1,
  },
  metaCard: {
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
  metaCardCompletada: {
    backgroundColor: '#f0fff0',
    borderLeftWidth: 4,
    borderLeftColor: '#00A859',
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaInfo: {
    flex: 1,
  },
  metaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metaCategoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaCategoria: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCompletada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeTexto: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  metaAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonAccion: {
    padding: 6,
  },
  metaDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  barraProgresoContainer: {
    marginBottom: 12,
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
    color: '#666',
  },
  metaInfoAdicional: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  tiempoAgotado: {
    color: '#D62C1A',
    fontWeight: '600',
  },
  botonAhorroRapido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonAhorroRapidoTexto: {
    color: '#fff',
    fontSize: 12,
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
    marginBottom: 20,
  },
  botonCrearPrimeraMeta: {
    backgroundColor: '#00A859',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botonCrearPrimeraMetaTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    zIndex: 999999,
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
    maxHeight: '90%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  categoriasContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoriaButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  categoriaButtonActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859',
  },
  categoriaButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoriaButtonTextActive: {
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

// screens/MetasScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Dimensions,
  TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MetaService from '../services/metaService';
import styles from '../styles/metas';

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
        await cargarMetas(); // Recargar datos desde la base de datos
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
      const resultado = await metaService.agregarAhorro(meta.id, montoNum);
      
      if (resultado.error) {
        Alert.alert("Error", resultado.error);
      } else {
        await cargarMetas(); // Recargar datos desde la base de datos
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
                await cargarMetas(); // Recargar datos desde la base de datos
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
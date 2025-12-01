import React, { useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList, Image, 
    ImageBackground, Dimensions, TextInput, Alert, Modal, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TransaccionService from "../Services/TransaccionService";
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get("window");

export default function TransaccionesScreen({ route }) {
  const isFocused = useIsFocused();
  const usuario = route.params?.usuario || { id: 1, nombre: 'Usuario' };
  const [filtro, setFiltro] = useState("todos");
  const [transacciones, setTransacciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionEditando, setTransaccionEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  
  // Estado para filtros avanzados
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    tipo: 'todos',
    categoria: 'todas',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    montoMin: '',
    montoMax: ''
  });

  const [form, setForm] = useState({
    tipo: "ingreso",
    monto: "",
    categoria: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  const transaccionService = new TransaccionService();

  useEffect(() => {
    if (isFocused) {
      cargarTransacciones();
      cargarCategorias();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      cargarTransacciones();
    }
  }, [filtro, isFocused]);

  const cargarTransacciones = async () => {
    try {
      const resultado = await transaccionService.obtenerTransacciones(usuario.id, filtro);
      if (resultado.ok) {
        // Las transacciones ya vienen ordenadas del servicio
        setTransacciones(resultado.transacciones);
        console.log("Transacciones cargadas:", resultado.transacciones.length);
        
        // Mostrar información de ordenamiento para debug
        if (resultado.transacciones.length > 0) {
          console.log("Primera transacción:", resultado.transacciones[0].fecha, "ID:", resultado.transacciones[0].id);
          console.log("Última transacción:", resultado.transacciones[resultado.transacciones.length-1].fecha, "ID:", resultado.transacciones[resultado.transacciones.length-1].id);
        }
      }
    } catch (error) {
      console.log("Error cargando transacciones:", error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const categoriasData = await transaccionService.obtenerCategoriasUnicas(usuario.id);
      setCategorias(categoriasData);
    } catch (error) {
      console.log("Error cargando categorías:", error);
    }
  };

  const aplicarFiltrosAvanzados = async () => {
    try {
      // Validar que solo haya un tipo de filtro activo
      const filtrosActivos = getFiltrosActivos();
      const tiposFiltro = [];
      
      if (filtrosAvanzados.categoria !== 'todas') tiposFiltro.push('categoría');
      if (filtrosAvanzados.fechaInicio || filtrosAvanzados.fechaFin) tiposFiltro.push('fecha');
      if (filtrosAvanzados.descripcion) tiposFiltro.push('descripción');
      if (filtrosAvanzados.montoMin || filtrosAvanzados.montoMax) tiposFiltro.push('monto');
      
      if (tiposFiltro.length > 1) {
        Alert.alert("Error", "Solo puedes aplicar un tipo de filtro a la vez. Por favor elige solo uno: categoría, fecha, descripción o monto.");
        return;
      }

      const resultado = await transaccionService.obtenerTransaccionesFiltradas(usuario.id, filtrosAvanzados);
      if (resultado.ok) {
        setTransacciones(resultado.transacciones);
        setModalFiltrosVisible(false);
        Alert.alert("Éxito", `Se encontraron ${resultado.transacciones.length} transacciones`);
      }
    } catch (error) {
      console.log("Error aplicando filtros:", error);
      Alert.alert("Error", "No se pudieron aplicar los filtros");
    }
  };

  const limpiarFiltrosAvanzados = () => {
    setFiltrosAvanzados({
      tipo: 'todos',
      categoria: 'todas',
      fechaInicio: '',
      fechaFin: '',
      descripcion: '',
      montoMin: '',
      montoMax: ''
    });
    cargarTransacciones();
  };

  const getFiltrosActivos = () => {
    const activos = [];
    if (filtrosAvanzados.tipo !== 'todos') activos.push(`Tipo: ${filtrosAvanzados.tipo}`);
    if (filtrosAvanzados.categoria !== 'todas') activos.push(`Categoría: ${filtrosAvanzados.categoria}`);
    if (filtrosAvanzados.fechaInicio) activos.push(`Desde: ${filtrosAvanzados.fechaInicio}`);
    if (filtrosAvanzados.fechaFin) activos.push(`Hasta: ${filtrosAvanzados.fechaFin}`);
    if (filtrosAvanzados.descripcion) activos.push(`Buscar: "${filtrosAvanzados.descripcion}"`);
    if (filtrosAvanzados.montoMin) activos.push(`Monto ≥ ${filtrosAvanzados.montoMin}`);
    if (filtrosAvanzados.montoMax) activos.push(`Monto ≤ ${filtrosAvanzados.montoMax}`);
    
    return activos;
  };

  const actualizarFiltro = (tipo, valor) => {
    const nuevosFiltros = {
      ...filtrosAvanzados,
      [tipo]: valor
    };
    
    // Limpiar otros filtros cuando se selecciona uno nuevo
    if (tipo === 'categoria' && valor !== 'todas') {
      nuevosFiltros.fechaInicio = '';
      nuevosFiltros.fechaFin = '';
      nuevosFiltros.descripcion = '';
      nuevosFiltros.montoMin = '';
      nuevosFiltros.montoMax = '';
    } else if (tipo === 'fechaInicio' || tipo === 'fechaFin') {
      if (valor || (tipo === 'fechaInicio' && filtrosAvanzados.fechaFin) || (tipo === 'fechaFin' && filtrosAvanzados.fechaInicio)) {
        nuevosFiltros.categoria = 'todas';
        nuevosFiltros.descripcion = '';
        nuevosFiltros.montoMin = '';
        nuevosFiltros.montoMax = '';
      }
    } else if (tipo === 'descripcion' && valor) {
      nuevosFiltros.categoria = 'todas';
      nuevosFiltros.fechaInicio = '';
      nuevosFiltros.fechaFin = '';
      nuevosFiltros.montoMin = '';
      nuevosFiltros.montoMax = '';
    } else if ((tipo === 'montoMin' || tipo === 'montoMax') && valor) {
      nuevosFiltros.categoria = 'todas';
      nuevosFiltros.fechaInicio = '';
      nuevosFiltros.fechaFin = '';
      nuevosFiltros.descripcion = '';
    }
    
    setFiltrosAvanzados(nuevosFiltros);
  };

  const abrirModalNuevo = () => {
    setTransaccionEditando(null);
    setForm({
      tipo: "ingreso",
      monto: "",
      categoria: "",
      descripcion: "",
      fecha: new Date().toISOString().split('T')[0]
    });
    setModalVisible(true);
  };

  const abrirModalEditar = (transaccion) => {
    setTransaccionEditando(transaccion);
    setForm({
      tipo: transaccion.tipo,
      monto: transaccion.monto.toString(),
      categoria: transaccion.categoria,
      descripcion: transaccion.descripcion || "",
      fecha: transaccion.fecha
    });
    setModalVisible(true);
  };

  const eliminarTransaccion = (id) => {
    Alert.alert(
      "Confirmar eliminación", 
      "¿Estás seguro de que quieres eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const resultado = await transaccionService.eliminarTransaccion(id);
              if (resultado.ok) {
                cargarTransacciones();
                Alert.alert("Éxito", "Transacción eliminada");
              } else {
                Alert.alert("Error", resultado.error || "Error al eliminar");
              }
            } catch (error) {
              Alert.alert("Error", "Error al eliminar la transacción");
            }
          }
        },
      ]
    );
  };

  const guardarTransaccion = async () => {
    if (!form.monto || !form.categoria || !form.fecha) {
      Alert.alert("Error", "Completa todos los campos requeridos");
      return;
    }

    const montoNum = parseFloat(form.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser un número válido mayor a 0");
      return;
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(form.fecha)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return;
    }

    const datosTransaccion = {
      tipo: form.tipo,
      monto: montoNum,
      categoria: form.categoria,
      descripcion: form.descripcion,
      fecha: form.fecha,
      usuario_id: usuario.id
    };

    try {
      let resultado;
      if (transaccionEditando) {
        resultado = await transaccionService.actualizarTransaccion(
          transaccionEditando.id,
          datosTransaccion.tipo,
          datosTransaccion.monto,
          datosTransaccion.categoria,
          datosTransaccion.descripcion,
          datosTransaccion.fecha
        );
      } else {
        resultado = await transaccionService.crearTransaccion(
          datosTransaccion.usuario_id,
          datosTransaccion.tipo,
          datosTransaccion.monto,
          datosTransaccion.categoria,
          datosTransaccion.descripcion,
          datosTransaccion.fecha
        );
      }

      if (resultado.error) {
        Alert.alert("Error", resultado.error);
      } else {
        setModalVisible(false);
        limpiarForm();
        await cargarTransacciones();
        Alert.alert("Éxito", 
          transaccionEditando ? "Transacción actualizada" : "Transacción creada exitosamente"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al guardar la transacción");
      console.log("Error guardando transacción:", error);
    }
  };

  const limpiarForm = () => {
    setForm({
      tipo: "ingreso",
      monto: "",
      categoria: "",
      descripcion: "",
      fecha: new Date().toISOString().split('T')[0]
    });
    setTransaccionEditando(null);
  };

  const formatearMonto = (monto, tipo) => {
    return `${tipo === 'ingreso' ? '+' : '-'}$${parseFloat(monto).toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

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
          <Text style={styles.headerTitle}>Transacciones</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {/* Filtros Rápidos */}
        <View style={styles.filterRow}>
          {["todos", "ingreso", "egreso"].map((opcion) => (
            <TouchableOpacity
              key={opcion}
              onPress={() => setFiltro(opcion)}
              style={[
                styles.filterButton,
                filtro === opcion && styles.filterActive,
              ]}
            >
              <Text style={[
                styles.filterText,
                filtro === opcion && styles.filterTextActive,
              ]}>
                {opcion === "ingreso" ? "Ingresos" : opcion === "egreso" ? "Egresos" : "Todos"}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Botón de Filtros Avanzados */}
          <TouchableOpacity
            style={styles.filtrosAvanzadosButton}
            onPress={() => setModalFiltrosVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color="#007b4a" />
          </TouchableOpacity>
        </View>

        {/* Mostrar filtros activos */}
        {getFiltrosActivos().length > 0 && (
          <View style={styles.filtrosActivosContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.filtrosActivosTitulo}>Filtros: </Text>
              {getFiltrosActivos().map((filtro, index) => (
                <View key={index} style={styles.filtroActivoChip}>
                  <Text style={styles.filtroActivoText}>{filtro}</Text>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.limpiarFiltrosButton}
                onPress={limpiarFiltrosAvanzados}
              >
                <Ionicons name="close-circle" size={16} color="#D62C1A" />
                <Text style={styles.limpiarFiltrosText}>Limpiar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Lista de transacciones */}
        <FlatList
          data={transacciones}
          keyExtractor={(item) => `${item.id}-${item.fecha}-${item.tipo}`}
          style={styles.lista}
          contentContainerStyle={transacciones.length === 0 && styles.listaVaciaContainer}
          renderItem={({ item, index }) => (
            <View style={[
              styles.transaccionItem,
              item.tipo === "ingreso" ? styles.transaccionIngreso : styles.transaccionEgreso
            ]}>
              <View style={styles.transaccionInfo}>
                <Text style={[
                  styles.monto,
                  item.tipo === "ingreso" ? styles.ingreso : styles.egreso
                ]}>
                  {formatearMonto(item.monto, item.tipo)}
                </Text>
                <View style={styles.transaccionDetalles}>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                  <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
                  {item.descripcion ? (
                    <Text style={styles.descripcion}>{item.descripcion}</Text>
                  ) : null}
                  {/* Mostrar número de orden para debug */}
                  <Text style={styles.ordenDebug}>#{index + 1} - ID: {item.id}</Text>
                </View>
              </View>
              <View style={styles.acciones}>
                <TouchableOpacity 
                  style={styles.botonAccion}
                  onPress={() => abrirModalEditar(item)}
                >
                  <Ionicons name="create-outline" size={20} color="#007b4a" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.botonAccion}
                  onPress={() => eliminarTransaccion(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#D62C1A" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listaVacia}>
              <Ionicons name="receipt-outline" size={50} color="#ccc" />
              <Text style={styles.textoListaVacia}>No hay transacciones</Text>
              <Text style={styles.subtextoListaVacia}>
                Presiona el botón + para agregar una transacción
              </Text>
            </View>
          }
        />
      </View>

      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalFiltrosVisible}
        onRequestClose={() => setModalFiltrosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity 
                onPress={() => setModalFiltrosVisible(false)}
                style={styles.botonCerrar}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.infoText}>
                 Selecciona solo un tipo de filtro a la vez
              </Text>
              
              {/* Filtro por Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Filtrar por Categoría</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriasContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoriaFiltroButton,
                      filtrosAvanzados.categoria === 'todas' && styles.categoriaFiltroButtonActive
                    ]}
                    onPress={() => actualizarFiltro('categoria', 'todas')}
                  >
                    <Text style={[
                      styles.categoriaFiltroButtonText,
                      filtrosAvanzados.categoria === 'todas' && styles.categoriaFiltroButtonTextActive
                    ]}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {categorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      style={[
                        styles.categoriaFiltroButton,
                        filtrosAvanzados.categoria === categoria && styles.categoriaFiltroButtonActive
                      ]}
                      onPress={() => actualizarFiltro('categoria', categoria)}
                    >
                      <Text style={[
                        styles.categoriaFiltroButtonText,
                        filtrosAvanzados.categoria === categoria && styles.categoriaFiltroButtonTextActive
                      ]}>
                        {categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Separador */}
              <View style={styles.separador}>
                <Text style={styles.separadorTexto}>O</Text>
              </View>

              {/* Filtro por Fechas */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Filtrar por Fecha</Text>
                <View style={styles.fechasContainer}>
                  <View style={styles.fechaInputGroup}>
                    <Text style={styles.fechaLabel}>Desde</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={filtrosAvanzados.fechaInicio}
                      onChangeText={(text) => actualizarFiltro('fechaInicio', text)}
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.fechaInputGroup}>
                    <Text style={styles.fechaLabel}>Hasta</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={filtrosAvanzados.fechaFin}
                      onChangeText={(text) => actualizarFiltro('fechaFin', text)}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              {/* Separador */}
              <View style={styles.separador}>
                <Text style={styles.separadorTexto}>O</Text>
              </View>

              {/* Filtro por Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Buscar en descripción</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Palabra clave..."
                  value={filtrosAvanzados.descripcion}
                  onChangeText={(text) => actualizarFiltro('descripcion', text)}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Separador */}
              <View style={styles.separador}>
                <Text style={styles.separadorTexto}>O</Text>
              </View>

              {/* Filtro por Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Filtrar por Monto</Text>
                <View style={styles.montoContainer}>
                  <View style={styles.montoInputGroup}>
                    <Text style={styles.montoLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={filtrosAvanzados.montoMin}
                      onChangeText={(text) => actualizarFiltro('montoMin', text)}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.montoInputGroup}>
                    <Text style={styles.montoLabel}>Máximo</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={filtrosAvanzados.montoMax}
                      onChangeText={(text) => actualizarFiltro('montoMax', text)}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              {/* Botones de acción */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.botonCancelar}
                  onPress={limpiarFiltrosAvanzados}
                >
                  <Text style={styles.botonCancelarTexto}>LIMPIAR TODO</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.botonAplicar}
                  onPress={aplicarFiltrosAvanzados}
                >
                  <Text style={styles.botonAplicarTexto}>APLICAR FILTRO</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para agregar/editar transacción */}
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
                {transaccionEditando ? 'Editar Transacción' : 'Nueva Transacción'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.botonCerrar}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Selector de Tipo */}
              <View style={styles.tipoContainer}>
                <Text style={styles.label}>Tipo de transacción</Text>
                <View style={styles.tipoButtons}>
                  <TouchableOpacity
                    style={[
                      styles.tipoButton, 
                      form.tipo === 'ingreso' && styles.tipoButtonActive
                    ]}
                    onPress={() => setForm({...form, tipo: 'ingreso'})}
                  >
                    <Text style={[
                      styles.tipoButtonText,
                      form.tipo === 'ingreso' && styles.tipoButtonTextActive
                    ]}>
                      Ingreso
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tipoButton, 
                      form.tipo === 'egreso' && styles.tipoButtonActive
                    ]}
                    onPress={() => setForm({...form, tipo: 'egreso'})}
                  >
                    <Text style={[
                      styles.tipoButtonText,
                      form.tipo === 'egreso' && styles.tipoButtonTextActive
                    ]}>
                      Egreso
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 100.50"
                  value={form.monto}
                  onChangeText={(text) => setForm({...form, monto: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Ej: ${form.tipo === 'ingreso' ? 'Sueldo' : 'Comida'}`}
                  value={form.categoria}
                  onChangeText={(text) => setForm({...form, categoria: text})}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Agrega una descripción..."
                  value={form.descripcion}
                  onChangeText={(text) => setForm({...form, descripcion: text})}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Fecha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={form.fecha}
                  onChangeText={(text) => setForm({...form, fecha: text})}
                  placeholderTextColor="#999"
                />
                <Text style={styles.helperText}>
                  Formato: Año-Mes-Día (Ej: 2024-01-15)
                </Text>
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
                  onPress={guardarTransaccion}
                >
                  <Text style={styles.botonGuardarTexto}>
                    {transaccionEditando ? 'ACTUALIZAR' : 'GUARDAR'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Botón flotante para agregar */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={abrirModalNuevo}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    marginTop: 170,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 5,
  },
  filterActive: { 
    backgroundColor: "#00A859" 
  },
  filterText: { 
    color: "#333", 
    fontWeight: "500",
    fontSize: 14,
  },
  filterTextActive: { 
    color: "#fff", 
    fontWeight: "600"
  },
  filtrosAvanzadosButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#007b4a',
  },
  filtrosActivosContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d4edda',
  },
  filtrosActivosTitulo: {
    fontSize: 12,
    color: '#007b4a',
    fontWeight: 'bold',
    marginRight: 8,
  },
  filtroActivoChip: {
    backgroundColor: '#007b4a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  filtroActivoText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  limpiarFiltrosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D62C1A',
  },
  limpiarFiltrosText: {
    color: '#D62C1A',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  lista: {
    flex: 1,
  },
  listaVaciaContainer: {
    flex: 1,
  },
  transaccionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transaccionIngreso: {
    borderLeftWidth: 4,
    borderLeftColor: '#00A859',
  },
  transaccionEgreso: {
    borderLeftWidth: 4,
    borderLeftColor: '#D62C1A',
  },
  transaccionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monto: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 15,
    minWidth: 90,
    textAlign: 'right',
  },
  ingreso: {
    color: '#00A859',
  },
  egreso: {
    color: '#D62C1A',
  },
  transaccionDetalles: {
    flex: 1,
  },
  categoria: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  descripcion: {
    fontSize: 12,
    color: "#888",
    fontStyle: 'italic',
  },
  ordenDebug: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAccion: {
    padding: 8,
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
  tipoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tipoButton: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  tipoButtonActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859',
  },
  tipoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tipoButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
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
  infoText: {
    fontSize: 12,
    color: '#007b4a',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
  },
  categoriasContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoriaFiltroButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  categoriaFiltroButtonActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859',
  },
  categoriaFiltroButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoriaFiltroButtonTextActive: {
    color: '#fff',
  },
  fechasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fechaInputGroup: {
    flex: 1,
  },
  fechaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  montoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  montoInputGroup: {
    flex: 1,
  },
  montoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  botonAplicar: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00A859',
  },
  botonAplicarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  separador: {
    alignItems: 'center',
    marginVertical: 10,
  },
  separadorTexto: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

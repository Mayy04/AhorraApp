// screens/TransaccionesScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList, Image, ImageBackground, 
  Dimensions, TextInput, Alert, Modal, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TransaccionService from "../services/TransaccionService.js";
import { styles } from "../styles/transacciones.js";


const { width, height } = Dimensions.get("window");

export default function TransaccionesScreen({ route }) {
  const usuario = route.params?.usuario || { id: 1, nombre: 'Usuario' };
  const [filtro, setFiltro] = useState("todos");
  const [transacciones, setTransacciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transaccionEditando, setTransaccionEditando] = useState(null);
  const [form, setForm] = useState({
    tipo: "ingreso",
    monto: "",
    categoria: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  });

  const transaccionService = new TransaccionService();

  // Categorías predefinidas
  const categorias = {
    ingreso: ['Sueldo', 'Freelance', 'Inversiones', 'Regalo', 'Otros'],
    egreso: ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Salud', 'Educación', 'Otros']
  };

  useEffect(() => {
    cargarTransacciones();
  }, [filtro]);

  const cargarTransacciones = async () => {
    try {
      const resultado = await transaccionService.obtenerTransacciones(usuario.id, filtro);
      if (resultado.ok) {
        setTransacciones(resultado.transacciones);
      }
    } catch (error) {
      console.log("Error cargando transacciones:", error);
    }
  };

  const guardarTransaccion = async () => {
    // Validaciones
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
        // Actualizar transacción existente
        resultado = await transaccionService.actualizarTransaccion(
          transaccionEditando.id,
          datosTransaccion.tipo,
          datosTransaccion.monto,
          datosTransaccion.categoria,
          datosTransaccion.descripcion,
          datosTransaccion.fecha
        );
      } else {
        // Crear nueva transacción
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
        cargarTransacciones();
        Alert.alert("Éxito", 
          transaccionEditando ? "Transacción actualizada" : "Transacción creada exitosamente"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al guardar la transacción");
      console.log("Error guardando transacción:", error);
    }
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
    // Convierte YYYY-MM-DD a DD/MM/YYYY
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
        {/* Filtros */}
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
        </View>

        {/* Lista de transacciones */}
        <FlatList
          data={transacciones}
          keyExtractor={(item) => item.id.toString()}
          style={styles.lista}
          contentContainerStyle={transacciones.length === 0 && styles.listaVaciaContainer}
          renderItem={({ item }) => (
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

      {/* Botón flotante para agregar */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={abrirModalNuevo}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
                <Text style={styles.helperText}>
                  Sugerencias: {categorias[form.tipo].join(', ')}
                </Text>
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
    </View>
  );
}



import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ImageBackground, Dimensions, Platform, TextInput, Alert,} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import MenuScreen from "./menuScreen";
const { width, height } = Dimensions.get("window");

export default function TransaccionesScreen() {
  const [filtro, setFiltro] = useState("Todos");
  
  const [transacciones, setTransacciones] = useState([
    { id: "1", tipo: "Ingreso", monto: "+$5000.00", categoria: "Sueldo", fecha: "07/09/25" },
    { id: "2", tipo: "Egreso", monto: "-$250.00", categoria: "Despensa", fecha: "05/09/25" },
    { id: "3", tipo: "Egreso", monto: "-$100.00", categoria: "Transporte", fecha: "03/09/25" },
    { id: "4", tipo: "Ingreso", monto: "+$1000.00", categoria: "Bono", fecha: "01/09/25" },
    { id: "5", tipo: "Ingreso", monto: "+$750.00", categoria: "Venta", fecha: "25/08/25" },
    { id: "6", tipo: "Egreso", monto: "-$80.00", categoria: "Café", fecha: "22/08/25" },
  ]);

  const [filtradas, setFiltradas] = useState(transacciones);

  useEffect(() => {
    setFiltradas(filtro === "Todos" ? transacciones : transacciones.filter((t) => t.tipo === filtro));
  }, [filtro, transacciones]);

  // Formulario inline
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ id: null, tipo: "Ingreso", monto: "", categoria: "", fecha: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [fabOptionsVisible, setFabOptionsVisible] = useState(false);

  const genId = () => Date.now().toString();

  const crearTransaccion = (nuevo) => {
    if (!nuevo.monto || !nuevo.categoria || !nuevo.fecha) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    const item = { ...nuevo, id: genId() };
    setTransacciones((prev) => [item, ...prev]);
    setFormVisible(false);
    setForm({ id: null, tipo: "Ingreso", monto: "", categoria: "", fecha: "" });
  };

  const actualizarTransaccion = (actualizado) => {
    if (!actualizado.monto || !actualizado.categoria || !actualizado.fecha) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    setTransacciones((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)));
    setFormVisible(false);
    setIsEditing(false);
    setForm({ id: null, tipo: "Ingreso", monto: "", categoria: "", fecha: "" });
  };

  const eliminarTransaccion = (id) => {
    Alert.alert("Confirmar", "¿Eliminar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setTransacciones((prev) => prev.filter((t) => t.id !== id)) },
    ]);
  };

  const abrirNuevo = (tipo = "Ingreso") => {
    setForm({ id: null, tipo: tipo, monto: "", categoria: "", fecha: "" });
    setIsEditing(false);
    setFormVisible(true);
    setFabOptionsVisible(false);
  };

  const abrirEditar = (item) => {
    setForm(item);
    setIsEditing(true);
    setFormVisible(true);
  };
   const [screen, setScreen]=useState('inicio');
  switch(screen){
    case 'regresar':
      return<MenuScreen/>
    case 'inicio':
      default:

  return (
    <View style={styles.container}>
      {/*Fondo verde*/}
      <ImageBackground
        source={require("../assets/fondo.png")}
        style={styles.headerBackground}
        resizeMode="stretch"
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={()=> setScreen('regresar')}>
            <Image
            source={require("../assets/logoAhorra_2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Transacciones</Text>
        </View>
      </ImageBackground>

      {/* Contenido fijo */}
      <View style={styles.content}>
        {/* Filtros */}
        <View style={styles.filterRow}>
          {["Todos", "Ingreso", "Egreso"].map((opcion) => (
            <TouchableOpacity
              key={opcion}
              onPress={() => setFiltro(opcion)}
              style={[
                styles.filterButton,
                filtro === opcion && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filtro === opcion && styles.filterTextActive,
                ]}
              >
                {opcion === "Ingreso" ? "Ingresos" : opcion === "Egreso" ? "Egresos" : "Todos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ordenar */}
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Ordenar por</Text>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Fecha</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </View>
        </View>

        {/* Encabezado de tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Monto</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Categoría</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Fecha</Text>
          <Text style={[styles.tableHeaderText, { width: 50 }]}></Text>
        </View>

        {/* Formulario inline */}
        {formVisible && (
          <View style={styles.formInline}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.tipoButton, form.tipo === 'Ingreso' && styles.tipoActive]} onPress={() => setForm((s) => ({ ...s, tipo: 'Ingreso' }))}>
                <Text style={form.tipo === 'Ingreso' ? styles.tipoTextActive : styles.tipoText}>Ingreso</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tipoButton, form.tipo === 'Egreso' && styles.tipoActive]} onPress={() => setForm((s) => ({ ...s, tipo: 'Egreso' }))}>
                <Text style={form.tipo === 'Egreso' ? styles.tipoTextActive : styles.tipoText}>Egreso</Text>
              </TouchableOpacity>
            </View>
            <TextInput placeholder="Monto (p.ej. +$100.00)" value={form.monto} onChangeText={(t) => setForm((s) => ({ ...s, monto: t }))} style={styles.input} />
            <TextInput placeholder="Categoría" value={form.categoria} onChangeText={(t) => setForm((s) => ({ ...s, categoria: t }))} style={styles.input} />
            <TextInput placeholder="Fecha (DD/MM/AA)" value={form.fecha} onChangeText={(t) => setForm((s) => ({ ...s, fecha: t }))} style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.formButton} onPress={() => { setFormVisible(false); setIsEditing(false); setForm({ id: null, tipo: 'Ingreso', monto: '', categoria: '', fecha: '' }); }}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formButton, { marginLeft: 10 }]} onPress={() => { isEditing ? actualizarTransaccion(form) : crearTransaccion(form); }}>
                <Text style={{ fontWeight: '600' }}>{isEditing ? 'Guardar' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista */}
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.monto,
                  item.tipo === "Ingreso" ? styles.ingreso : styles.egreso, { flex: 1 },
                ]}
              >
                {item.monto}
              </Text>
              <Text style={[styles.categoria, { flex: 1 }]}>{item.categoria}</Text>
              <Text style={[styles.fecha, { flex: 1 }]}>{item.fecha}</Text>
              <View style={styles.iconos}>
                <TouchableOpacity onPress={() => abrirEditar(item)}>
                  <MaterialIcons name="edit" size={18} color="#555" style={{ marginRight: 8 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => eliminarTransaccion(item.id)}>
                  <MaterialIcons name="delete-outline" size={18} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/*Botón flotante */}
      {fabOptionsVisible && (
        <View style={styles.fabOptions}>
          <TouchableOpacity style={styles.fabOption} onPress={() => abrirNuevo('Ingreso')}>
            <Text style={{ fontWeight: '700' }}>Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.fabOption, { backgroundColor: '#FFD6D6' }]} onPress={() => abrirNuevo('Egreso')}>
            <Text style={{ fontWeight: '700' }}>Egreso</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setFabOptionsVisible((s) => !s)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/*Navbar */}
      <Image
        source={require("../assets/navbar.png")}
        style={styles.navbarImage}
        resizeMode="contain"
      />
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  //Fondo verde 
  headerBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: height * 0.60,
    zIndex: 0,
  },
  //Logo y titulo dentro del fondo verde
  headerOverlay: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 20 : 60,
    paddingLeft: Platform.OS === "web" ? 40 : 20,
  },
  logo: {
    width: Platform.OS === "web" ? 200 : width * 0.35,
    height: Platform.OS === "web" ? 100 : height * 0.08,
    marginBottom: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: width > 600 ? 40 : 26,
    fontWeight: "bold",
  },

  //Contenido 
  content: {
    flex: 1,
    marginTop: height * 0.25, // controla qué tanto se superpone con el fondo verde
    zIndex: 1,
  },

  //Filtros
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 5,
    marginVertical: 4,
  },
  filterActive: { 
    backgroundColor: "#00A859" 
  },
  filterText: 
  { color: "#333", 
    fontWeight: "500"     
  },
  filterTextActive: { 
    color: "#fff", 
    fontWeight: "600"
  },

  // Ordenar
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: width * 0.06,
    marginTop: 15,
  },
  orderLabel: { 
    color: "#333", 
    marginRight: 10, 
    fontSize: 14 
},
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dropdownText: { 
    fontSize: 14, 
    marginRight: 5 
  },

  // Tablas
  // Encabezado de la tabla
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: width * 0.05,
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 4,
  },
  // Texto del encabezado de la tabla
  tableHeaderText: { color: "#333", fontWeight: "600", fontSize: 13 },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.05,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
    paddingVertical: 10,
  },
  // Texto de las filas de la tabla
  monto: { 
    fontSize: 14,
    fontWeight: "bold" 
  },
  ingreso: { 
    color: "#00A859" 
  },
  egreso: { 
    color: "#D62C1A" 
  },
  categoria: { 
    fontSize: 14, 
    color: "#333", 
    fontWeight: "500" 
  },
  fecha: { 
    fontSize: 13, 
    color: "#555" 
  },
  iconos: { 
    flexDirection: "row", 
    width: 50, 
    justifyContent: "flex-end" 
  },

  // Botón flotante
fab: {
  position: "absolute",
  bottom: Platform.OS === "web" ? height * 0.09 : height * 0.12, //que tan arriba desde el borde inferior
  right: Platform.OS === "web" ? width * 0.08 : width * 0.06, //que tan alejado desde el borde derecho
  backgroundColor: "#FFD600",
  width: Platform.OS === "web" ? 55 : width * 0.13,// Tamaños ancho y alto del boton distintos según plataforma
  height: Platform.OS === "web" ? 55 : width * 0.13,
  borderRadius: 50,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2,
},

  //Navbar
  navbarImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.15,
    zIndex: 2,
    
  },
  // Formulario inline
  formInline: {
    marginHorizontal: width * 0.05,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  tipoActive: { backgroundColor: '#00A859', borderColor: '#00A859' },
  tipoText: { color: '#333' },
  tipoTextActive: { color: '#fff', fontWeight: '600' },
  formButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#E6E6E6' },
  fabOptions: {
    position: 'absolute',
    right: Platform.OS === 'web' ? width * 0.08 : width * 0.06,
    bottom: Platform.OS === 'web' ? height * 0.2 : height * 0.28,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  fabOption: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

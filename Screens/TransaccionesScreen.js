import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ImageBackground, Dimensions, Platform,} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function TransaccionesScreen() {
  const [filtro, setFiltro] = useState("Todos");

  const transacciones = [
    { id: "1", tipo: "Ingreso", monto: "+$5000.00", categoria: "Sueldo", fecha: "07/09/25" },
    { id: "2", tipo: "Egreso", monto: "-$250.00", categoria: "Despensa", fecha: "05/09/25" },
    { id: "3", tipo: "Egreso", monto: "-$100.00", categoria: "Transporte", fecha: "03/09/25" },
    { id: "4", tipo: "Ingreso", monto: "+$1000.00", categoria: "Bono", fecha: "01/09/25" },
    { id: "5", tipo: "Ingreso", monto: "+$750.00", categoria: "Venta", fecha: "25/08/25" },
    { id: "6", tipo: "Egreso", monto: "-$80.00", categoria: "Café", fecha: "22/08/25" },
  ];

  const filtradas =
    filtro === "Todos" ? transacciones : transacciones.filter((t) => t.tipo === filtro);

  return (
    <View style={styles.container}>
      {/*Fondo verde */}
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

      {/*Contenido fijo */}
      <View style={styles.content}>
        {/*Filtros*/}
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
                <MaterialIcons name="edit" size={18} color="#555" style={{ marginRight: 8 }} />
                <MaterialIcons name="delete-outline" size={18} color="#555" />
              </View>
            </View>
          )}
        />
      </View>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/*Navbar*/}
      <Image
        source={require("../assets/navbar.png")}
        style={styles.navbarImage}
        resizeMode="cover"
      />
    </View>
  );
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
    paddingTop: Platform.OS === "web" ? 30 : 60,
    paddingLeft: 25,
  },
  logo: {
    width: width * 0.10,
    height: height * 0.06,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: width > 600 ? 36 : 26,
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
  filterActive: { backgroundColor: "#00A859" },
  filterText: { color: "#333", fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  // Ordenar
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: width * 0.06,
    marginTop: 15,
  },
  orderLabel: { color: "#333", marginRight: 10, fontSize: 14 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dropdownText: { fontSize: 14, marginRight: 5 },

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
  monto: { fontSize: 14, fontWeight: "bold" },
  ingreso: { color: "#00A859" },
  egreso: { color: "#D62C1A" },
  categoria: { fontSize: 14, color: "#333", fontWeight: "500" },
  fecha: { fontSize: 13, color: "#555" },
  iconos: { flexDirection: "row", width: 50, justifyContent: "flex-end" },

  // Botón flotante
fab: {
  position: "absolute",
  bottom: Platform.OS === "web" ? height * 0.09 : height * 0.12, //que tan arriba desde el borde inferior
  right: Platform.OS === "web" ? width * 0.08 : width * 0.06, //que tan alejado desde el borde derecho
  backgroundColor: "#FFD600",

  // Tamaños ancho y alto del boton distintos según plataforma
  width: Platform.OS === "web" ? 55 : width * 0.13,
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

    width: "cover",
    height: height * 0.1,
    zIndex: 2,
    
  },
});

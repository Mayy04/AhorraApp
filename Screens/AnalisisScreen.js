import React from "react";
import {View, Text, StyleSheet, Image, ImageBackground, Dimensions, Platform,} from "react-native";

const { width, height } = Dimensions.get("window");

export default function AnalisisScreen() {
  return (
    <View style={styles.container}>
      {/*Fondo verde*/}
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

      {/*Gráficos de análisis*/}  
      <View style={styles.graficoContainer}>
        <Image
          source={require("../assets/ingresos.png")}
          style={styles.grafico}
          resizeMode="contain"
        />
        <Image 
          source={require("../assets/egresos.png")}
          style={styles.grafico}
          resizeMode="contain"
        />
      </View>

      {/*Navbar*/}
      <Image
        source={require("../assets/navbar.png")}
        style={styles.navbarImage}
        resizeMode="contain"
      />
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
    width: "100%",
    height: height * 0.60,
    zIndex: 0,
  },
  headerOverlay: {
    flex: 1,
    flexDirection: "column",
    paddingTop: Platform.OS === "web" ? 10 : 60,
    paddingLeft: Platform.OS === "web" ? 30 : 25,
    alignItems: "flex-start",
  },

  logo: {
    width: Platform.OS === "web" ? width * 0.10 : width * 0.25,
    height: Platform.OS === "web" ? height * 0.10 : height * 0.06,
    marginBottom: Platform.OS === "web" ? 10 : 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: width > 600 ? 36 : 26,
    fontWeight: "bold",
  },

  graficoContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: height * 0.25, 
    zIndex: 1,
  },

  grafico: {
    width: Platform.OS === "web" ? width * 0.36 : width * 0.85,
    height: Platform.OS === "web" ? height * 0.30 : height * 0.23,
    borderRadius: 10,
  },

  navbarImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: Platform.OS === "web" ? 65 : height * 0.15,
    zIndex: 2,
  },
});

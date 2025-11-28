// =====================================================
// SERVICIO DE BASE DE DATOS SQLITE (Práctica 18)
// =====================================================

import * as SQLite from "expo-sqlite";

export default class DatabaseService {
  constructor() {
    // Abrimos la base de datos
    this.db = SQLite.openDatabase("usuarios.db");
    // Creamos la tabla al iniciar
    this.init();
  }
  // ----------------------------------
  // CREAR TABLA
  // ----------------------------------
  init() {
    this.db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          correo TEXT,
          telefono TEXT,
          contrasena TEXT
        );`
      );
    });
  }

  // ----------------------------------
  // INSERTAR USUARIO
  // ----------------------------------

  insertUsuario(nombre, correo, telefono, contrasena) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO usuarios (nombre, correo, telefono, contrasena) VALUES (?, ?, ?, ?)",
          [nombre, correo, telefono, contrasena],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  // ----------------------------------
  // CONSULTAR USUARIOS
  // ----------------------------------

 
  getUsuarios() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM usuarios",
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }
}
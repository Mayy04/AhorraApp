import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default class DatabaseService {
    constructor() {
        this.db = null;
        this.storageKey = 'usuarios';
    }

    async initialize() {
        if (this.db) return;

        if (Platform.OS === 'web') {
            console.log("Usando localStorage para web");
            return;
        }

        this.db = await SQLite.openDatabaseAsync('usuarios.db');

        try {
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    correo TEXT UNIQUE,
                    telefono TEXT,
                    contrasena TEXT
                );
            `);

            console.log("Tabla usuarios lista ✔️");
        } catch (error) {
            console.log("Error creando tabla:", error);
        }
    }

    // -------------------------------
    // INSERTAR USUARIO
    // -------------------------------
    async insertUsuario(nombre, correo, telefono, contrasena) {
        await this.initialize();

        try {
            await this.db.runAsync(
                `INSERT INTO usuarios (nombre, correo, telefono, contrasena)
                 VALUES (?, ?, ?, ?)`,
                [nombre, correo, telefono, contrasena]
            );

            return { ok: true };
        } catch (error) {
            console.log("Error insertando usuario:", error);
            return { error: "No se pudo guardar el usuario" };
        }
    }

    // -------------------------------
    // OBTENER TODOS LOS USUARIOS
    // -------------------------------
    async getUsuarios() {
        await this.initialize();

        try {
            const resultado = await this.db.getAllAsync(`SELECT * FROM usuarios`);
            return resultado;
        } catch (error) {
            console.log("Error obteniendo usuarios:", error);
            return [];
        }
    }

    // -------------------------------
    // RECUPERAR / ACTUALIZAR CONTRASEÑA 
    // -------------------------------
    async actualizarContrasena(correo, telefono, nuevaContrasena) {
        await this.initialize();

        try {
            // ¿Existe el usuario?
            const usuario = await this.db.getFirstAsync(
                `SELECT * FROM usuarios WHERE correo = ? AND telefono = ?`,
                [correo, telefono]
            );

            if (!usuario) {
                return { error: "Datos incorrectos. Usuario no encontrado." };
            }

            // Actualizar contraseña
            await this.db.runAsync(
                `UPDATE usuarios SET contrasena = ? WHERE correo = ? AND telefono = ?`,
                [nuevaContrasena, correo, telefono]
            );

            return { ok: true };
        } catch (error) {
            console.log("Error al actualizar contraseña:", error);
            return { error: "Error al actualizar la contraseña" };
        }
    }
}
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

class DatabaseService {

    constructor() {
        this.db = null;
    }

    async initialize() {

        // WEB
        if (Platform.OS === "web") return;

        // MÓVIL — BD nueva para incluir columnas nuevas
        this.db = await SQLite.openDatabaseAsync("miapp_v2.db");

        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                correo TEXT UNIQUE NOT NULL,
                telefono TEXT NOT NULL,
                contrasena TEXT NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    // Agregar nuevo usuario
    async add(nombre, correo, telefono, contrasena) {

        if (Platform.OS === "web") {

            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

            const nuevo = {
                id: Date.now(),
                nombre,
                correo,
                telefono,
                contrasena,
                fechaCreacion: new Date().toISOString()
            };

            usuarios.push(nuevo);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            return nuevo;
        }

        // Móvil
        const result = await this.db.runAsync(
            "INSERT INTO usuarios (nombre, correo, telefono, contrasena) VALUES (?, ?, ?, ?)",
            [nombre, correo, telefono, contrasena]
        );

        return {
            id: result.lastInsertRowId,
            nombre,
            correo,
            telefono,
            contrasena,
            fechaCreacion: new Date().toISOString()
        };
    }

    // Buscar por correo
    async getByCorreo(correo) {

        if (Platform.OS === "web") {
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            return usuarios.find(u => u.correo === correo) || null;
        }

        return await this.db.getFirstAsync(
            "SELECT * FROM usuarios WHERE correo = ?",
            [correo]
        );
    }

    // Actualizar contraseña
    async updatePassword(id, nuevaContrasena) {

        if (Platform.OS === "web") {
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const index = usuarios.findIndex(u => u.id === id);

            usuarios[index].contrasena = nuevaContrasena;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            return true;
        }

        await this.db.runAsync(
            "UPDATE usuarios SET contrasena = ? WHERE id = ?",
            [nuevaContrasena, id]
        );

        return true;
    }
}

export default new DatabaseService();

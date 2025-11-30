import * as SQLite from 'expo-sqlite';

export default class DatabaseService {
    constructor() {
        this.db = null;
    }

    async initialize() {
        if (this.db) return;

        this.db = await SQLite.openDatabaseAsync('ahorraplus.db');

        try {
            // Tabla de usuarios
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

            // Tabla de transacciones
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS transacciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'egreso')),
                    monto REAL NOT NULL,
                    categoria TEXT NOT NULL,
                    descripcion TEXT,
                    fecha TEXT NOT NULL,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );
            `);

            console.log("Base de datos lista");
        } catch (error) {
            console.log("Error creando tablas:", error);
        }
    }

    // USUARIOS
    async insertUsuario(nombre, correo, telefono, contrasena) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `INSERT INTO usuarios (nombre, correo, telefono, contrasena) VALUES (?, ?, ?, ?)`,
                [nombre, correo, telefono, contrasena]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error insertando usuario:", error);
            return { error: "El correo ya está registrado" };
        }
    }

    async buscarUsuarioPorCredenciales(correo, contrasena) {
        await this.initialize();
        try {
            const usuario = await this.db.getFirstAsync(
                `SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?`,
                [correo, contrasena]
            );
            return usuario;
        } catch (error) {
            console.log("Error buscando usuario:", error);
            return null;
        }
    }

    // TRANSACCIONES
    async insertTransaccion(usuario_id, tipo, monto, categoria, descripcion, fecha) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `INSERT INTO transacciones (usuario_id, tipo, monto, categoria, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?)`,
                [usuario_id, tipo, monto, categoria, descripcion, fecha]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error insertando transacción:", error);
            return { error: "No se pudo guardar la transacción" };
        }
    }

    async getTransaccionesPorUsuario(usuario_id, filtro = 'todos') {
        await this.initialize();
        try {
            let query = `SELECT * FROM transacciones WHERE usuario_id = ?`;
            const params = [usuario_id];

            if (filtro !== 'todos') {
                query += ` AND tipo = ?`;
                params.push(filtro);
            }

            query += ` ORDER BY fecha DESC`;
            return await this.db.getAllAsync(query, params);
        } catch (error) {
            console.log("Error obteniendo transacciones:", error);
            return [];
        }
    }

    async actualizarTransaccion(id, tipo, monto, categoria, descripcion, fecha) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `UPDATE transacciones SET tipo = ?, monto = ?, categoria = ?, descripcion = ?, fecha = ? WHERE id = ?`,
                [tipo, monto, categoria, descripcion, fecha, id]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error actualizando transacción:", error);
            return { error: "Error al actualizar" };
        }
    }

    async eliminarTransaccion(id) {
        await this.initialize();
        try {
            await this.db.runAsync(`DELETE FROM transacciones WHERE id = ?`, [id]);
            return { ok: true };
        } catch (error) {
            console.log("Error eliminando transacción:", error);
            return { error: "Error al eliminar" };
        }
    }

   
}
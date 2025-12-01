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
 
            // Tabla de presupuestos
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS presupuestos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    categoria TEXT NOT NULL,
                    monto REAL NOT NULL,
                    periodo TEXT NOT NULL DEFAULT 'mensual',
                    mes TEXT NOT NULL,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );
            `);

            // Tabla de metas
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS metas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    nombre TEXT NOT NULL,
                    monto_objetivo REAL NOT NULL,
                    monto_actual REAL DEFAULT 0,
                    fecha_objetivo TEXT NOT NULL,
                    categoria TEXT NOT NULL,
                    descripcion TEXT,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completada BOOLEAN DEFAULT 0,
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

    async buscarUsuarioPorCorreo(correo) {
        await this.initialize();
        try {
            const usuario = await this.db.getFirstAsync(
                `SELECT * FROM usuarios WHERE correo = ?`,
                [correo]
            );
            return usuario;
        } catch (error) {
            console.log("Error buscando usuario por correo:", error);
            return null;
        }
    }

    async actualizarContrasena(correo, nuevaContrasena) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `UPDATE usuarios SET contrasena = ? WHERE correo = ?`,
                [nuevaContrasena, correo]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error actualizando contraseña:", error);
            return { error: "Error al actualizar la contraseña" };
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

    async getResumenFinanciero(usuario_id) {
        await this.initialize();
        try {
            const mesActual = new Date().toISOString().substring(0, 7); 
            
            // Ingresos del mes actual
            const ingresos = await this.db.getFirstAsync(
                `SELECT SUM(monto) as total FROM transacciones 
                WHERE usuario_id = ? AND tipo = 'ingreso' 
                AND strftime('%Y-%m', fecha) = ?`,
                [usuario_id, mesActual]
            );
            
            // Gastos del mes actual
            const egresos = await this.db.getFirstAsync(
                `SELECT SUM(monto) as total FROM transacciones 
                WHERE usuario_id = ? AND tipo = 'egreso' 
                AND strftime('%Y-%m', fecha) = ?`,
                [usuario_id, mesActual]
            );

            // Saldo total (todas las transacciones)
            const saldoTotal = await this.db.getFirstAsync(
                `SELECT 
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'ingreso') -
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'egreso') as saldo
                `,
                [usuario_id, usuario_id]
            );

            const ingresosMes = ingresos?.total || 0;
            const gastosMes = egresos?.total || 0;
            const ahorroMes = ingresosMes - gastosMes;
            const saldoActual = saldoTotal?.saldo || 0;

            return {
                saldoActual: saldoActual,
                ingresosMes: ingresosMes,
                gastosMes: gastosMes,
                ahorroMes: ahorroMes,
                mesActual: mesActual
            };
        } catch (error) {
            console.log("Error obteniendo resumen:", error);
            return { 
                saldoActual: 0, 
                ingresosMes: 0, 
                gastosMes: 0, 
                ahorroMes: 0,
                mesActual: new Date().toISOString().substring(0, 7)
            };
        }
    }

    // PRESUPUESTOS
    async insertPresupuesto(usuario_id, categoria, monto, periodo, mes) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `INSERT INTO presupuestos (usuario_id, categoria, monto, periodo, mes) VALUES (?, ?, ?, ?, ?)`,
                [usuario_id, categoria, monto, periodo, mes]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error insertando presupuesto:", error);
            return { error: "No se pudo guardar el presupuesto" };
        }
    }

    async getPresupuestosPorUsuario(usuario_id, mes = null) {
        await this.initialize();
        try {
            let query = `SELECT * FROM presupuestos WHERE usuario_id = ?`;
            const params = [usuario_id];
            
            if (mes) {
                query += ` AND mes = ?`;
                params.push(mes);
            }
            
            query += ` ORDER BY categoria`;
            return await this.db.getAllAsync(query, params);
        } catch (error) {
            console.log("Error obteniendo presupuestos:", error);
            return [];
        }
    }

    async actualizarPresupuesto(id, categoria, monto, periodo) {
        await this.initialize();
        try {
            await this.db.runAsync(
                `UPDATE presupuestos SET categoria = ?, monto = ?, periodo = ? WHERE id = ?`,
                [categoria, monto, periodo, id]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error actualizando presupuesto:", error);
            return { error: "Error al actualizar" };
        }
    }

    async eliminarPresupuesto(id) {
        await this.initialize();
        try {
            await this.db.runAsync(`DELETE FROM presupuestos WHERE id = ?`, [id]);
            return { ok: true };
        } catch (error) {
            console.log("Error eliminando presupuesto:", error);
            return { error: "Error al eliminar" };
        }
    }

    async getGastosPorCategoria(usuario_id, mes) {
        await this.initialize();
        try {
            const gastos = await this.db.getAllAsync(`
                SELECT categoria, SUM(monto) as total_gastado
                FROM transacciones 
                WHERE usuario_id = ? 
                AND tipo = 'egreso' 
                AND strftime('%Y-%m', fecha) = ?
                GROUP BY categoria
            `, [usuario_id, mes]);
            
            return gastos;
        } catch (error) {
            console.log("Error obteniendo gastos por categoría:", error);
            return [];
        }
    }

    // MÉTODOS PARA FILTROS
    async getTransaccionesFiltradas(usuario_id, filtros = {}) {
        await this.initialize();
        try {
            let query = `SELECT * FROM transacciones WHERE usuario_id = ?`;
            const params = [usuario_id];
            
            // Filtro por tipo
            if (filtros.tipo && filtros.tipo !== 'todos') {
                query += ` AND tipo = ?`;
                params.push(filtros.tipo);
            }
            
            // Filtro por categoría
            if (filtros.categoria && filtros.categoria !== 'todas') {
                query += ` AND categoria = ?`;
                params.push(filtros.categoria);
            }
            
            // Filtro por rango de fechas
            if (filtros.fechaInicio && filtros.fechaFin) {
                query += ` AND fecha BETWEEN ? AND ?`;
                params.push(filtros.fechaInicio, filtros.fechaFin);
            } else if (filtros.fechaInicio) {
                query += ` AND fecha >= ?`;
                params.push(filtros.fechaInicio);
            } else if (filtros.fechaFin) {
                query += ` AND fecha <= ?`;
                params.push(filtros.fechaFin);
            }
            
            // Filtro por descripción (búsqueda)
            if (filtros.descripcion) {
                query += ` AND descripcion LIKE ?`;
                params.push(`%${filtros.descripcion}%`);
            }
            
            // Filtro por monto
            if (filtros.montoMin !== undefined && filtros.montoMin !== '') {
                query += ` AND monto >= ?`;
                params.push(parseFloat(filtros.montoMin));
            }
            
            if (filtros.montoMax !== undefined && filtros.montoMax !== '') {
                query += ` AND monto <= ?`;
                params.push(parseFloat(filtros.montoMax));
            }
            
            query += ` ORDER BY fecha DESC, id DESC`;
            
            return await this.db.getAllAsync(query, params);
        } catch (error) {
            console.log("Error obteniendo transacciones filtradas:", error);
            return [];
        }
    }

    async getCategoriasUnicas(usuario_id) {
        await this.initialize();
        try {
            const categorias = await this.db.getAllAsync(`
                SELECT DISTINCT categoria 
                FROM transacciones 
                WHERE usuario_id = ? 
                ORDER BY categoria
            `, [usuario_id]);
            
            return categorias.map(item => item.categoria);
        } catch (error) {
            console.log("Error obteniendo categorías:", error);
            return [];
        }
    }

    // MÉTODOS PARA METAS
    async insertMeta(usuario_id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion) {
        await this.initialize();
        try {
            const completada = monto_actual >= monto_objetivo ? 1 : 0;
            
            await this.db.runAsync(
                `INSERT INTO metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion, completada)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [usuario_id, nombre, monto_objetivo, monto_actual || 0, fecha_objetivo, categoria, descripcion || '', completada]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error insertando meta:", error);
            return { error: "No se pudo guardar la meta" };
        }
    }

    async getMetasPorUsuario(usuario_id) {
        await this.initialize();
        try {
            const metas = await this.db.getAllAsync(
                `SELECT * FROM metas WHERE usuario_id = ? ORDER BY fecha_objetivo ASC`,
                [usuario_id]
            );
            return metas;
        } catch (error) {
            console.log("Error obteniendo metas:", error);
            return [];
        }
    }

    async actualizarMeta(id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion) {
        await this.initialize();
        try {
            const completada = monto_actual >= monto_objetivo ? 1 : 0;
            
            await this.db.runAsync(
                `UPDATE metas SET 
                    nombre = ?, monto_objetivo = ?, monto_actual = ?, 
                    fecha_objetivo = ?, categoria = ?, descripcion = ?, completada = ?
                WHERE id = ?`,
                [nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion, completada, id]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error actualizando meta:", error);
            return { error: "Error al actualizar la meta" };
        }
    }

    async actualizarMontoMeta(id, nuevoMonto) {
        await this.initialize();
        try {
            const meta = await this.db.getFirstAsync(
                `SELECT * FROM metas WHERE id = ?`,
                [id]
            );
            
            if (!meta) {
                return { error: "Meta no encontrada" };
            }
            
            const completada = nuevoMonto >= meta.monto_objetivo ? 1 : 0;
            
            await this.db.runAsync(
                `UPDATE metas SET monto_actual = ?, completada = ? WHERE id = ?`,
                [nuevoMonto, completada, id]
            );
            return { ok: true };
        } catch (error) {
            console.log("Error actualizando monto de meta:", error);
            return { error: "Error al actualizar el monto" };
        }
    }

    async eliminarMeta(id) {
        await this.initialize();
        try {
            await this.db.runAsync(`DELETE FROM metas WHERE id = ?`, [id]);
            return { ok: true };
        } catch (error) {
            console.log("Error eliminando meta:", error);
            return { error: "Error al eliminar la meta" };
        }
    }

    async getEstadisticasMetas(usuario_id) {
        await this.initialize();
        try {
            const estadisticas = await this.db.getFirstAsync(`
                SELECT 
                    COUNT(*) as total_metas,
                    SUM(CASE WHEN completada = 1 THEN 1 ELSE 0 END) as metas_completadas,
                    SUM(monto_actual) as total_ahorrado,
                    SUM(monto_objetivo) as total_objetivo,
                    AVG(CASE WHEN completada = 0 THEN (monto_actual / monto_objetivo) * 100 ELSE 100 END) as progreso_promedio
                FROM metas 
                WHERE usuario_id = ?
            `, [usuario_id]);
            
            return estadisticas;
        } catch (error) {
            console.log("Error obteniendo estadísticas de metas:", error);
            return { total_metas: 0, metas_completadas: 0, total_ahorrado: 0, total_objetivo: 0, progreso_promedio: 0 };
        }
    }

    // Método auxiliar para ejecutar consultas
    async getAllAsync(sql, params = []) {
        await this.initialize();
        try {
            return await this.db.getAllAsync(sql, params);
        } catch (error) {
            console.log("Error en getAllAsync:", error);
            return [];
        }
    }

    async getFirstAsync(sql, params = []) {
        await this.initialize();
        try {
            return await this.db.getFirstAsync(sql, params);
        } catch (error) {
            console.log("Error en getFirstAsync:", error);
            return null;
        }
    }

    async runAsync(sql, params = []) {
        await this.initialize();
        try {
            return await this.db.runAsync(sql, params);
        } catch (error) {
            console.log("Error en runAsync:", error);
            throw error;
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

            query += ` ORDER BY fecha DESC, id DESC`;
            return await this.db.getAllAsync(query, params);
        } catch (error) {
            console.log("Error obteniendo transacciones:", error);
            return [];
        }
    }

    async getTransaccionesFiltradas(usuario_id, filtros = {}) {
        await this.initialize();
        try {
            let query = `SELECT * FROM transacciones WHERE usuario_id = ?`;
            const params = [usuario_id];
            
            // Filtro por tipo
            if (filtros.tipo && filtros.tipo !== 'todos') {
                query += ` AND tipo = ?`;
                params.push(filtros.tipo);
            }
            
            // Filtro por categoría
            if (filtros.categoria && filtros.categoria !== 'todas') {
                query += ` AND categoria = ?`;
                params.push(filtros.categoria);
            }
            
            // Filtro por rango de fechas
            if (filtros.fechaInicio && filtros.fechaFin) {
                query += ` AND fecha BETWEEN ? AND ?`;
                params.push(filtros.fechaInicio, filtros.fechaFin);
            } else if (filtros.fechaInicio) {
                query += ` AND fecha >= ?`;
                params.push(filtros.fechaInicio);
            } else if (filtros.fechaFin) {
                query += ` AND fecha <= ?`;
                params.push(filtros.fechaFin);
            }
            
            // Filtro por descripción
            if (filtros.descripcion) {
                query += ` AND descripcion LIKE ?`;
                params.push(`%${filtros.descripcion}%`);
            }
            
            // Filtro por monto
            if (filtros.montoMin !== undefined && filtros.montoMin !== '') {
                query += ` AND monto >= ?`;
                params.push(parseFloat(filtros.montoMin));
            }
            
            if (filtros.montoMax !== undefined && filtros.montoMax !== '') {
                query += ` AND monto <= ?`;
                params.push(parseFloat(filtros.montoMax));
            }
            
            query += ` ORDER BY fecha DESC, id DESC`;
            
            return await this.db.getAllAsync(query, params);
        } catch (error) {
            console.log("Error obteniendo transacciones filtradas:", error);
            return [];
        }
    }

    // Transacciones recientes
    async getTransaccionesRecientes(usuario_id, limite = 10) {
        await this.initialize();
        try {
            const transacciones = await this.db.getAllAsync(`
                SELECT * FROM transacciones 
                WHERE usuario_id = ? 
                ORDER BY id DESC, fecha DESC
                LIMIT ?
            `, [usuario_id, limite]);
            return transacciones;
        } catch (error) {
            console.log("Error obteniendo transacciones recientes:", error);
            return [];
        }
    }
}
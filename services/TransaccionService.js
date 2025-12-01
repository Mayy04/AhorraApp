import DatabaseService from '../database/DatabaseService';

export default class TransaccionService {
    constructor() {
        this.db = new DatabaseService();
    }

    async crearTransaccion(usuario_id, tipo, monto, categoria, descripcion, fecha) {
        console.log("Creando transacción:", { 
            usuario_id, 
            tipo, 
            monto, 
            categoria, 
            descripcion, 
            fecha 
        });
        
        // Validaciones
        if (!usuario_id || !tipo || !monto || !categoria || !fecha) {
            return { error: "Todos los campos son requeridos" };
        }

        if (monto <= 0) {
            return { error: "El monto debe ser mayor a 0" };
        }

        // Validar formato de fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) {
            return { error: "Formato de fecha inválido. Usa YYYY-MM-DD" };
        }

        try {
            const resultado = await this.db.insertTransaccion(
                usuario_id, 
                tipo, 
                monto, 
                categoria, 
                descripcion, 
                fecha
            );
            
            console.log("Resultado creación:", resultado);
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Transacción creada exitosamente",
                transaccion: {
                    usuario_id,
                    tipo,
                    monto,
                    categoria,
                    descripcion,
                    fecha
                }
            };
        } catch (error) {
            console.log("Error en servicio crearTransaccion:", error);
            return { error: "Error del servidor al crear transacción" };
        }
    }

    async obtenerTransacciones(usuario_id, filtro = 'todos') {
        console.log("Obteniendo transacciones para usuario:", usuario_id, "Filtro:", filtro);
        
        try {
            const transacciones = await this.db.getTransaccionesPorUsuario(usuario_id, filtro);
            console.log(`Se encontraron ${transacciones.length} transacciones`);
            
            return { 
                ok: true, 
                transacciones,
                total: transacciones.length
            };
        } catch (error) {
            console.log("Error obteniendo transacciones:", error);
            return { 
                error: "Error al cargar transacciones",
                transacciones: [],
                total: 0
            };
        }
    }

    async actualizarTransaccion(id, tipo, monto, categoria, descripcion, fecha) {
        console.log("Actualizando transacción ID:", id, { tipo, monto, categoria, descripcion, fecha });
        
        // Validaciones
        if (!id || !tipo || !monto || !categoria || !fecha) {
            return { error: "Todos los campos son requeridos" };
        }

        if (monto <= 0) {
            return { error: "El monto debe ser mayor a 0" };
        }

        // Validar formato de fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) {
            return { error: "Formato de fecha inválido. Usa YYYY-MM-DD" };
        }

        try {
            const resultado = await this.db.actualizarTransaccion(
                id, 
                tipo, 
                monto, 
                categoria, 
                descripcion, 
                fecha
            );
            
            console.log("Resultado actualización:", resultado);
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Transacción actualizada exitosamente",
                transaccion: {
                    id,
                    tipo,
                    monto,
                    categoria,
                    descripcion,
                    fecha
                }
            };
        } catch (error) {
            console.log("Error actualizando transacción:", error);
            return { error: "Error al actualizar la transacción" };
        }
    }

    async eliminarTransaccion(id) {
        console.log("Eliminando transacción ID:", id);
        
        if (!id) {
            return { error: "ID de transacción requerido" };
        }

        try {
            const resultado = await this.db.eliminarTransaccion(id);
            console.log("Resultado eliminación:", resultado);
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Transacción eliminada exitosamente",
                idEliminado: id
            };
        } catch (error) {
            console.log("Error eliminando transacción:", error);
            return { error: "Error al eliminar la transacción" };
        }
    }

    async obtenerResumen(usuario_id) {
        console.log("Obteniendo resumen para usuario:", usuario_id);
        
        try {
            const resumen = await this.db.getResumenFinanciero(usuario_id);
            console.log("Resumen obtenido:", resumen);
            
            return resumen;
        } catch (error) {
            console.log("Error obteniendo resumen:", error);
            return { 
                saldoActual: 0, 
                ingresosMes: 0, 
                gastosMes: 0, 
                ahorroMes: 0,
                mesActual: new Date().toISOString().substring(0, 7),
                error: "Error al cargar resumen"
            };
        }
    }

    async obtenerEstadisticasAvanzadas(usuario_id) {
        console.log("Obteniendo estadísticas avanzadas para usuario:", usuario_id);
        
        try {
            await this.db.initialize();
            
            // Top categorías de gastos
            const topGastos = await this.db.getAllAsync(`
                SELECT categoria, SUM(monto) as total, COUNT(*) as cantidad
                FROM transacciones 
                WHERE usuario_id = ? AND tipo = 'egreso'
                GROUP BY categoria 
                ORDER BY total DESC 
                LIMIT 5
            `, [usuario_id]);

            // Top categorías de ingresos
            const topIngresos = await this.db.getAllAsync(`
                SELECT categoria, SUM(monto) as total, COUNT(*) as cantidad
                FROM transacciones 
                WHERE usuario_id = ? AND tipo = 'ingreso'
                GROUP BY categoria 
                ORDER BY total DESC 
                LIMIT 5
            `, [usuario_id]);

            // Transacciones del mes actual
            const mesActual = new Date().toISOString().substring(0, 7);
            const transaccionesMes = await this.db.getAllAsync(`
                SELECT tipo, COUNT(*) as cantidad, SUM(monto) as total
                FROM transacciones 
                WHERE usuario_id = ? AND strftime('%Y-%m', fecha) = ?
                GROUP BY tipo
            `, [usuario_id, mesActual]);

            // Promedio mensual de ingresos
            const promedioIngresos = await this.db.getFirstAsync(`
                SELECT AVG(total) as promedio
                FROM (
                    SELECT strftime('%Y-%m', fecha) as mes, SUM(monto) as total
                    FROM transacciones 
                    WHERE usuario_id = ? AND tipo = 'ingreso'
                    GROUP BY mes
                )
            `, [usuario_id]);

            // Promedio mensual de gastos
            const promedioGastos = await this.db.getFirstAsync(`
                SELECT AVG(total) as promedio
                FROM (
                    SELECT strftime('%Y-%m', fecha) as mes, SUM(monto) as total
                    FROM transacciones 
                    WHERE usuario_id = ? AND tipo = 'egreso'
                    GROUP BY mes
                )
            `, [usuario_id]);

            const estadisticas = {
                topGastos: topGastos || [],
                topIngresos: topIngresos || [],
                transaccionesMes: transaccionesMes || [],
                promedioIngresos: promedioIngresos?.promedio || 0,
                promedioGastos: promedioGastos?.promedio || 0,
                mesActual: mesActual
            };

            console.log("Estadísticas avanzadas:", estadisticas);
            return estadisticas;

        } catch (error) {
            console.log("Error obteniendo estadísticas avanzadas:", error);
            return {
                topGastos: [],
                topIngresos: [],
                transaccionesMes: [],
                promedioIngresos: 0,
                promedioGastos: 0,
                mesActual: new Date().toISOString().substring(0, 7),
                error: "Error al cargar estadísticas"
            };
        }
    }

    async obtenerHistorialMensual(usuario_id, meses = 6) {
        console.log("Obteniendo historial mensual para usuario:", usuario_id, "Meses:", meses);
        
        try {
            await this.db.initialize();
            
            const historial = await this.db.getAllAsync(`
                SELECT 
                    strftime('%Y-%m', fecha) as mes,
                    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
                    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as gastos,
                    (SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) - 
                     SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END)) as ahorro
                FROM transacciones 
                WHERE usuario_id = ?
                GROUP BY mes
                ORDER BY mes DESC
                LIMIT ?
            `, [usuario_id, meses]);

            console.log("Historial mensual obtenido:", historial);
            return historial;

        } catch (error) {
            console.log("Error obteniendo historial mensual:", error);
            return [];
        }
    }

    async obtenerTransaccionesRecientes(usuario_id, limite = 10) {
        console.log("Obteniendo transacciones recientes para usuario:", usuario_id);
        
        try {
            const transacciones = await this.db.getAllAsync(`
                SELECT * FROM transacciones 
                WHERE usuario_id = ? 
                ORDER BY fecha DESC, id DESC
                LIMIT ?
            `, [usuario_id, limite]);

            console.log(`${transacciones.length} transacciones recientes obtenidas`);
            return transacciones;

        } catch (error) {
            console.log("Error obteniendo transacciones recientes:", error);
            return [];
        }
    }

    async buscarTransacciones(usuario_id, criterio) {
        console.log("Buscando transacciones para usuario:", usuario_id, "Criterio:", criterio);
        
        if (!criterio || criterio.trim() === '') {
            return await this.obtenerTransacciones(usuario_id);
        }

        try {
            const busqueda = `%${criterio}%`;
            const transacciones = await this.db.getAllAsync(`
                SELECT * FROM transacciones 
                WHERE usuario_id = ? AND 
                      (categoria LIKE ? OR descripcion LIKE ?)
                ORDER BY fecha DESC
            `, [usuario_id, busqueda, busqueda]);

            console.log(`Se encontraron ${transacciones.length} transacciones con el criterio: ${criterio}`);
            return { 
                ok: true, 
                transacciones,
                total: transacciones.length,
                criterio: criterio
            };

        } catch (error) {
            console.log("Error buscando transacciones:", error);
            return { 
                error: "Error al buscar transacciones",
                transacciones: [],
                total: 0,
                criterio: criterio
            };
        }
    }

    async obtenerBalanceGeneral(usuario_id) {
        console.log("Obteniendo balance general para usuario:", usuario_id);
        
        try {
            const balance = await this.db.getFirstAsync(`
                SELECT 
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'ingreso') as total_ingresos,
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'egreso') as total_gastos,
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'ingreso') -
                    (SELECT COALESCE(SUM(monto), 0) FROM transacciones WHERE usuario_id = ? AND tipo = 'egreso') as balance_total,
                    (SELECT COUNT(*) FROM transacciones WHERE usuario_id = ?) as total_transacciones,
                    (SELECT COUNT(DISTINCT categoria) FROM transacciones WHERE usuario_id = ?) as categorias_activas
            `, [usuario_id, usuario_id, usuario_id, usuario_id, usuario_id, usuario_id]);

            console.log("Balance general obtenido:", balance);
            return balance;

        } catch (error) {
            console.log("Error obteniendo balance general:", error);
            return {
                total_ingresos: 0,
                total_gastos: 0,
                balance_total: 0,
                total_transacciones: 0,
                categorias_activas: 0
            };
        }
    }
}
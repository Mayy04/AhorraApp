import DatabaseService from '../database/databaseService';

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
        // Reemplazar la función obtenerResumen existente
    async obtenerResumen(usuario_id) {
        console.log("Obteniendo resumen COMPLETO para usuario:", usuario_id);
        
        try {
            const resumen = await this.db.getResumenFinancieroCompleto(usuario_id);
            console.log("Resumen completo obtenido:", resumen);
            
            return resumen;
        } catch (error) {
            console.log("Error obteniendo resumen completo:", error);
            return { 
                saldoActual: 0, 
                ingresosMes: 0, 
                gastosMes: 0, 
                ahorroMes: 0,
                totalAhorradoMetas: 0,
                saldoDisponible: 0,
                mesActual: new Date().toISOString().substring(0, 7),
                error: "Error al cargar resumen"
            };
        }
    }

    // Nueva función para obtener categorías de transacciones
    async obtenerCategoriasDeTransacciones(usuario_id) {
        console.log("Obteniendo categorías de transacciones para usuario:", usuario_id);
        
        try {
            const categorias = await this.db.getCategoriasDeTransacciones(usuario_id);
            console.log("Categorías obtenidas:", categorias);
            
            return categorias;
        } catch (error) {
            console.log("Error obteniendo categorías:", error);
            return [];
        }
    }

    
}
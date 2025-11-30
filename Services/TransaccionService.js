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



    
}
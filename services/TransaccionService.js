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

            // Actualizar automáticamente los presupuestos cuando se genera un egreso
            if (tipo === 'egreso') {
                await this.actualizarPresupuestosPorEgreso(usuario_id, categoria, monto);
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

    // Actualizar presupuestos cuando se hace un egreso
    async actualizarPresupuestosPorEgreso(usuario_id, categoria, monto) {
        try {
            console.log(`Actualizando presupuestos por egreso: ${categoria} - $${monto}`);
            
            const presupuestoService = new (await import('./presupuestoService')).default();
            
            // Forzar la actualización del progreso de los presupuestos
            const resultado = await presupuestoService.actualizarProgresoPresupuestos(usuario_id);
            
            if (resultado.ok) {
                console.log(`Presupuestos actualizados después del egreso en ${categoria}`);
                const presupuestoAfectado = resultado.presupuestos.find(p => 
                    p.categoria.toLowerCase() === categoria.toLowerCase()
                );
                
                if (presupuestoAfectado) {
                    console.log(`Presupuesto afectado: ${presupuestoAfectado.categoria} - Gastado: $${presupuestoAfectado.gastoActual} de $${presupuestoAfectado.monto}`);
                } else {
                    console.log(`No hay presupuesto configurado para la categoría: ${categoria}`);
                }
            } else {
                console.log("Error actualizando presupuestos después del egreso");
            }
        } catch (error) {
            console.log("Error actualizando presupuestos por egreso:", error);
        }
    }

    async obtenerTransacciones(usuario_id, filtro = 'todos') {
        console.log("Obteniendo transacciones para usuario:", usuario_id, "Filtro:", filtro);
        
        try {
            const transacciones = await this.db.getTransaccionesPorUsuario(usuario_id, filtro);
            console.log(`Se encontraron ${transacciones.length} transacciones`);
            
            // Asegurar que estén ordenadas correctamente
            const transaccionesOrdenadas = transacciones.sort((a, b) => {
                // Primero por fecha (más reciente primero)
                const fechaCompare = new Date(b.fecha) - new Date(a.fecha);
                if (fechaCompare !== 0) return fechaCompare;
                // Si misma fecha, por ID (más reciente primero)
                return b.id - a.id;
            });
            
            return { 
                ok: true, 
                transacciones: transaccionesOrdenadas,
                total: transaccionesOrdenadas.length
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
            const transacciones = await this.db.getTransaccionesRecientes(usuario_id, limite);
            console.log(`${transacciones.length} transacciones recientes obtenidas`);
            return transacciones;
        } catch (error) {
            console.log("Error obteniendo transacciones recientes:", error);
            return [];
        }
    }

    async obtenerTransaccionesFiltradas(usuario_id, filtros = {}) {
        console.log("Obteniendo transacciones filtradas:", { usuario_id, filtros });
        
        try {
            const transacciones = await this.db.getTransaccionesFiltradas(usuario_id, filtros);
            console.log(`Se encontraron ${transacciones.length} transacciones con filtros`);
            
            // Ordenamiento
            const transaccionesOrdenadas = transacciones.sort((a, b) => {
                const fechaCompare = new Date(b.fecha) - new Date(a.fecha);
                if (fechaCompare !== 0) return fechaCompare;
                return b.id - a.id;
            });
            
            return { 
                ok: true, 
                transacciones: transaccionesOrdenadas,
                total: transaccionesOrdenadas.length,
                filtrosAplicados: filtros
            };
        } catch (error) {
            console.log("Error obteniendo transacciones filtradas:", error);
            return { 
                error: "Error al cargar transacciones",
                transacciones: [],
                total: 0,
                filtrosAplicados: filtros
            };
        }
    }

    async obtenerCategoriasUnicas(usuario_id) {
        console.log("Obteniendo categorías únicas para usuario:", usuario_id);
        
        try {
            const categorias = await this.db.getCategoriasUnicas(usuario_id);
            console.log("Categorías obtenidas:", categorias);
            
            return categorias;
        } catch (error) {
            console.log("Error obteniendo categorías:", error);
            return [];
        }
    }
}

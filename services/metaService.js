
import DatabaseService from '../database/DatabaseService';

export default class MetaService {
    constructor() {
        this.db = new DatabaseService();
    }

    async crearMeta(usuario_id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion) {
        console.log("Creando meta:", { usuario_id, nombre, monto_objetivo, fecha_objetivo, categoria });
        
        // Validaciones
        if (!usuario_id || !nombre || !monto_objetivo || !fecha_objetivo || !categoria) {
            return { error: "Todos los campos requeridos deben estar completos" };
        }

        if (monto_objetivo <= 0) {
            return { error: "El monto objetivo debe ser mayor a 0" };
        }

        if (monto_actual && monto_actual > monto_objetivo) {
            return { error: "El monto actual no puede ser mayor al objetivo" };
        }

        // Validar fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha_objetivo)) {
            return { error: "Formato de fecha inválido. Usa YYYY-MM-DD" };
        }

        try {
            const resultado = await this.db.insertMeta(
                usuario_id, 
                nombre, 
                monto_objetivo, 
                monto_actual || 0, 
                fecha_objetivo, 
                categoria, 
                descripcion
            );
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Meta creada exitosamente",
                meta: {
                    usuario_id,
                    nombre,
                    monto_objetivo,
                    monto_actual: monto_actual || 0,
                    fecha_objetivo,
                    categoria,
                    descripcion: descripcion || ''
                }
            };
        } catch (error) {
            console.log("Error en servicio crearMeta:", error);
            return { error: "Error del servidor al crear meta" };
        }
    }

    async obtenerMetas(usuario_id) {
        console.log("Obteniendo metas para usuario:", usuario_id);
        
        try {
            const metas = await this.db.getMetasPorUsuario(usuario_id);
            console.log(`Se encontraron ${metas.length} metas`);
            
            // Calcular datos adicionales
            const metasConCalculos = metas.map(meta => {
                const porcentaje = (meta.monto_actual / meta.monto_objetivo) * 100;
                const diasRestantes = this.calcularDiasRestantes(meta.fecha_objetivo);
                
                return {
                    ...meta,
                    porcentaje: porcentaje,
                    diasRestantes: diasRestantes,
                    completada: meta.completada === 1
                };
            });
            
            return { 
                ok: true, 
                metas: metasConCalculos,
                total: metasConCalculos.length
            };
        } catch (error) {
            console.log("Error obteniendo metas:", error);
            return { 
                error: "Error al cargar metas",
                metas: [],
                total: 0
            };
        }
    }

    async actualizarMeta(id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion) {
        console.log("Actualizando meta ID:", id, { nombre, monto_objetivo, monto_actual });
        
        // Validaciones
        if (!id || !nombre || !monto_objetivo || !fecha_objetivo || !categoria) {
            return { error: "Todos los campos requeridos deben estar completos" };
        }

        if (monto_objetivo <= 0) {
            return { error: "El monto objetivo debe ser mayor a 0" };
        }

        if (monto_actual > monto_objetivo) {
            return { error: "El monto actual no puede ser mayor al objetivo" };
        }

        try {
            const resultado = await this.db.actualizarMeta(
                id, nombre, monto_objetivo, monto_actual, fecha_objetivo, categoria, descripcion
            );
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Meta actualizada exitosamente"
            };
        } catch (error) {
            console.log("Error actualizando meta:", error);
            return { error: "Error al actualizar la meta" };
        }
    }

    async agregarAhorro(id, monto, usuario_id) {
        console.log("Agregando ahorro a meta ID:", id, "Monto:", monto, "Usuario:", usuario_id);
        
        if (!id || !monto || !usuario_id) {
            return { error: "ID, monto y usuario_id son requeridos" };
        }

        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            return { error: "El monto debe ser un número válido mayor a 0" };
        }

        try {
            // Obtener meta actual
            const metas = await this.db.getMetasPorUsuario(usuario_id);
            const meta = metas.find(m => m.id === id);
            
            if (!meta) {
                return { error: "Meta no encontrada" };
            }

            // Verificar si hay saldo suficiente
            const transaccionService = new (await import('./TransaccionService')).default();
            const resumen = await transaccionService.obtenerResumen(usuario_id);
            
            if (resumen.saldoActual < montoNum) {
                return { error: "Saldo insuficiente para agregar a la meta" };
            }

            const nuevoMonto = meta.monto_actual + montoNum;
            
            // Actualizar monto en la meta
            const resultado = await this.db.actualizarMontoMeta(id, nuevoMonto);
            
            if (resultado.error) {
                return resultado;
            }

            // Crear transacción de egreso para el ahorro
            await transaccionService.crearTransaccion(
                usuario_id,
                'egreso',
                montoNum,
                'Ahorro para meta: ' + meta.nombre,
                `Ahorro agregado a meta: ${meta.nombre}`,
                new Date().toISOString().split('T')[0]
            );
            
            return { 
                ok: true, 
                mensaje: `Se agregaron $${montoNum} a la meta`,
                nuevoMonto: nuevoMonto,
                metaActualizada: { ...meta, monto_actual: nuevoMonto }
            };
        } catch (error) {
            console.log("Error agregando ahorro:", error);
            return { error: "Error al agregar ahorro" };
        }
    }

    async eliminarMeta(id) {
        console.log("🗑️ Eliminando meta ID:", id);
        
        if (!id) {
            return { error: "ID de meta requerido" };
        }

        try {
            const resultado = await this.db.eliminarMeta(id);
            
            if (resultado.error) {
                return resultado;
            }
            
            return { 
                ok: true, 
                mensaje: "Meta eliminada exitosamente",
                idEliminado: id
            };
        } catch (error) {
            console.log("Error eliminando meta:", error);
            return { error: "Error al eliminar la meta" };
        }
    }

    async obtenerEstadisticas(usuario_id) {
        console.log("Obteniendo estadísticas de metas para usuario:", usuario_id);
        
        try {
            const estadisticas = await this.db.getEstadisticasMetas(usuario_id);
            
            // Calcular porcentaje total
            const porcentajeTotal = estadisticas.total_objetivo > 0 
                ? (estadisticas.total_ahorrado / estadisticas.total_objetivo) * 100 
                : 0;
            
            return {
                ...estadisticas,
                porcentajeTotal: porcentajeTotal
            };
        } catch (error) {
            console.log("Error obteniendo estadísticas:", error);
            return { 
                total_metas: 0, 
                metas_completadas: 0, 
                total_ahorrado: 0, 
                total_objetivo: 0, 
                progreso_promedio: 0,
                porcentajeTotal: 0
            };
        }
    }

    calcularDiasRestantes(fechaObjetivo) {
        const hoy = new Date();
        const objetivo = new Date(fechaObjetivo);
        const diferencia = objetivo.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24));
    }
}

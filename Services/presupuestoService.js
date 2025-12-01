
import DatabaseService from '../database/DatabaseService';

export default class PresupuestoService {
    constructor() {
        this.db = new DatabaseService();
    }

    async crearPresupuesto(usuario_id, categoria, monto, periodo = 'mensual') {
        const mes = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        if (!categoria || !monto || monto <= 0) {
            return { error: "Datos del presupuesto inválidos" };
        }

        try {
            await this.db.insertPresupuesto(usuario_id, categoria, monto, periodo, mes);
            return { ok: true, mensaje: "Presupuesto creado exitosamente" };
        } catch (error) {
            console.log("Error insertando presupuesto:", error);
            return { error: "No se pudo guardar el presupuesto" };
        }
    }

    async obtenerPresupuestos(usuario_id, mes = null) {
        try {
            const presupuestos = await this.db.getPresupuestosPorUsuario(usuario_id, mes);
            
            return { 
                ok: true, 
                presupuestos,
                total: presupuestos.length
            };
        } catch (error) {
            console.log("Error obteniendo presupuestos:", error);
            return { 
                error: "Error al cargar presupuestos",
                presupuestos: [],
                total: 0
            };
        }
    }

    async actualizarPresupuesto(id, categoria, monto, periodo) {
        try {
            await this.db.actualizarPresupuesto(id, categoria, monto, periodo);
            return { ok: true, mensaje: "Presupuesto actualizado exitosamente" };
        } catch (error) {
            console.log("Error actualizando presupuesto:", error);
            return { error: "Error al actualizar el presupuesto" };
        }
    }

    async eliminarPresupuesto(id) {
        try {
            await this.db.eliminarPresupuesto(id);
            return { ok: true, mensaje: "Presupuesto eliminado exitosamente" };
        } catch (error) {
            console.log("Error eliminando presupuesto:", error);
            return { error: "Error al eliminar el presupuesto" };
        }
    }

    async obtenerGastosPorCategoria(usuario_id, mes) {
        try {
            const gastos = await this.db.getGastosPorCategoria(usuario_id, mes);
            console.log(`Gastos por categoría para mes ${mes}:`, gastos);
            return gastos;
        } catch (error) {
            console.log("Error obteniendo gastos por categoría:", error);
            return [];
        }
    }

    async obtenerPresupuestosConProgreso(usuario_id) {
        try {
            const mesActual = new Date().toISOString().substring(0, 7);
            console.log(`Obteniendo presupuestos con progreso para usuario ${usuario_id}, mes ${mesActual}`);
            
            // Obtener presupuestos
            const resultadoPresupuestos = await this.obtenerPresupuestos(usuario_id, mesActual);
            
            if (!resultadoPresupuestos.ok) {
                console.log("Error obteniendo presupuestos");
                return { presupuestos: [], total: 0 };
            }

            console.log(`Presupuestos encontrados: ${resultadoPresupuestos.presupuestos.length}`);

            // Obtener gastos del mes actual
            const gastosPorCategoria = await this.obtenerGastosPorCategoria(usuario_id, mesActual);
            console.log(`Gastos por categoría encontrados: ${gastosPorCategoria.length}`);

            // Combinar presupuestos con gastos reales
            const presupuestosConProgreso = resultadoPresupuestos.presupuestos.map(presupuesto => {
                const gasto = gastosPorCategoria.find(g => 
                    g.categoria.toLowerCase() === presupuesto.categoria.toLowerCase()
                );
                const gastoActual = gasto ? parseFloat(gasto.total_gastado) : 0;
                const porcentaje = presupuesto.monto > 0 ? (gastoActual / presupuesto.monto) * 100 : 0;
                
                console.log(`${presupuesto.categoria}: Presupuesto $${presupuesto.monto}, Gastado $${gastoActual}, ${porcentaje.toFixed(1)}%`);
                
                return {
                    ...presupuesto,
                    gastoActual,
                     // Máximo 100%
                    porcentaje: Math.min(porcentaje, 100),
                    restante: presupuesto.monto - gastoActual
                };
            });
            
            return {
                ok: true,
                presupuestos: presupuestosConProgreso,
                total: presupuestosConProgreso.length,
                mes: mesActual
            };
        } catch (error) {
            console.log("Error obteniendo presupuestos con progreso:", error);
            return { 
                error: "Error al cargar presupuestos",
                presupuestos: [],
                total: 0
            };
        }
    }
    async actualizarProgresoPresupuestos(usuario_id) {
        try {
            console.log("Forzando actualización de progreso de presupuestos");
            return await this.obtenerPresupuestosConProgreso(usuario_id);
        } catch (error) {
            console.log("Error actualizando progreso de presupuestos:", error);
            return { error: "Error al actualizar progreso" };
        }
    }
}
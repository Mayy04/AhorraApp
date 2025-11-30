import Presupuesto from "../MODELS/presupuesto";
import FinanzasDB from "../database/finanzasBD";

export default class PresupuestoController {
  constructor() {
    this.db = new FinanzasDB();
  }

  async crear(nombre, monto, fecha) {
    const p = new Presupuesto(nombre, monto, fecha);
    const error = p.validar();
    if (error) return { error };

    try {
      await this.db.insertPresupuesto(nombre, monto, fecha);
      return { ok: true };
    } catch (e) {
      return { error: "Error al guardar presupuesto en BD" };
    }
  }

  async listar() {
    try {
      const datos = await this.db.getPresupuestos();
      return { ok: true, datos };
    } catch (e) {
      return { error: "Error al obtener presupuestos" };
    }
  }

  async editar(id, nombre, monto, fecha) {
    const p = new Presupuesto(nombre, monto, fecha);
    const error = p.validar();
    if (error) return { error };

    try {
      await this.db.updatePresupuesto(id, nombre, monto, fecha);
      return { ok: true };
    } catch (e) {
      return { error: "Error al actualizar presupuesto" };
    }
  }

  async eliminar(id) {
    try {
      await this.db.deletePresupuesto(id);
      return { ok: true };
    } catch (e) {
      return { error: "Error al eliminar presupuesto" };
    }
  }
}

export default class Transaccion {
  constructor(descripcion, monto, tipo, categoria, fecha) {
    this.descripcion = descripcion;
    this.monto = monto;
    this.tipo = tipo;
    this.categoria = categoria;
    this.fecha = fecha;
  }

  validar() {
    if (!this.tipo || !["Ingreso", "Egreso"].includes(this.tipo)) return "Tipo inválido.";
    if (!this.monto || isNaN(this.monto) || this.monto <= 0) return "Monto inválido.";
    if (!this.fecha) return "Fecha requerida.";
    return null;
  }
}

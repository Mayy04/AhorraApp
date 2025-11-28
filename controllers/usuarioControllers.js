import Usuario from "../Models/usuario";
import DatabaseService from "../database/databaseService";

export default class UsuarioController {
  constructor() {
    this.db = new DatabaseService();
  }

  async crearUsuario(nombre, correo, telefono, contrasena) {
    const usuario = new Usuario(nombre, correo, telefono, contrasena);
    const error = usuario.validar();
    if (error) return { error };

    try {
      await this.db.insertUsuario(nombre, correo, telefono, contrasena);
      return { ok: true };
    } catch (e) {
      return { error: "Error al guardar en la base de datos" };
    }
  }

  async obtenerUsuarios() {
    try {
      const datos = await this.db.getUsuarios();
      return { ok: true, datos };
    } catch (e) {
      return { error: "Error al obtener usuarios de la base de datos" };
    }
  }
}


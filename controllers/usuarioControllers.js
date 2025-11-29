import Usuario from "../Models/usuario";
import DatabaseService from "../database/databaseService";

export default class UsuarioController {
  constructor() {
    this.db = new DatabaseService();
  }

  // ----------------------------------
  // CREAR USUARIO
  // ----------------------------------
  async crearUsuario(nombre, correo, telefono, contrasena) {
    const usuario = new Usuario(nombre, correo, telefono, contrasena);
    const error = usuario.validar();
    if (error) return { error };

    try {
      await this.db.insertUsuario(nombre, correo, telefono, contrasena);
      return { ok: true };
    } catch (e) {
      console.log("ERROR INSERT:", e);
      return { error: "Error al guardar en la base de datos" };
    }
  }

  // ----------------------------------
  // OBTENER TODOS LOS USUARIOS
  // ----------------------------------
  async obtenerUsuarios() {
    try {
      const datos = await this.db.getUsuarios();
      return { ok: true, datos };
    } catch (e) {
      return { error: "Error al obtener usuarios de la base de datos" };
    }
  }

  // ----------------------------------
  // BUSCAR USUARIO (para recuperar contraseña)
  // ----------------------------------
  async buscarUsuario(nombre, correo) {
    try {
      const datos = await this.db.buscarUsuarioPorNombreCorreo(nombre, correo);

      if (!datos || datos.length === 0) {
        return { error: "Usuario no encontrado" };
      }

      return { ok: true, datos };
    } catch (e) {
      console.log("ERROR BUSCAR:", e);
      return { error: "Error al buscar usuario" };
    }
  }

  // ----------------------------------
  // ACTUALIZAR CONTRASEÑA
  // ----------------------------------
  async actualizarContrasena(id, nuevaContrasena) {
    try {
      await this.db.actualizarContrasena(id, nuevaContrasena);
      return { ok: true };
    } catch (e) {
      console.log("ERROR UPDATE:", e);
      return { error: "Error al actualizar contraseña" };
    }
  }
}

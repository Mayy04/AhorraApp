import DatabaseService from '../database/DatabaseService';

export default class UsuarioService {
    constructor() {
        this.db = new DatabaseService();
    }

    async crearUsuario(nombre, correo, telefono, contrasena) {
        if (!nombre || nombre.length < 3) {
            return { error: "El nombre debe tener al menos 3 caracteres" };
        }
        if (!correo || !correo.includes('@')) {
            return { error: "Correo electrónico no válido" };
        }
        if (!telefono || telefono.length < 10) {
            return { error: "Teléfono debe tener mínimo 10 dígitos" };
        }
        if (!contrasena || contrasena.length < 4) {
            return { error: "Contraseña debe tener mínimo 4 caracteres" };
        }

        return await this.db.insertUsuario(nombre, correo, telefono, contrasena);
    }

    async iniciarSesion(correo, contrasena) {
        if (!correo || !contrasena) {
            return { error: "Correo y contraseña son requeridos" };
        }

        const usuario = await this.db.buscarUsuarioPorCredenciales(correo, contrasena);
        if (!usuario) {
            return { error: "Credenciales incorrectas" };
        }

        return { ok: true, usuario };
    }
}
import DatabaseService from '../database/DatabaseService';

export default class UsuarioService {
    constructor() {
        this.db = new DatabaseService();
    }

    async crearUsuario(nombre, correo, telefono, contrasena) {
        if (!nombre || nombre.length < 3) {
            return { error: "El nombre debe tener al menos 3 caracteres" };
        }
        if (!correo || !this.validarCorreo(correo)) {
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

    // Recuperación de contraseña
    async validarCredencialesRecuperacion(correo, telefono) {
        if (!correo || !telefono) {
            return { error: "Correo y teléfono son requeridos" };
        }

        const usuario = await this.db.buscarUsuarioPorCorreo(correo);
        if (!usuario) {
            return { error: "No existe una cuenta con este correo" };
        }

        if (usuario.telefono !== telefono) {
            return { error: "El teléfono no coincide con los registros" };
        }

        return { ok: true, usuario };
    }

    async actualizarContrasena(correo, nuevaContrasena) {
        if (!correo || !nuevaContrasena) {
            return { error: "Todos los campos son requeridos" };
        }

        if (nuevaContrasena.length < 4) {
            return { error: "La contraseña debe tener mínimo 4 caracteres" };
        }

        return await this.db.actualizarContrasena(correo, nuevaContrasena);
    }

    // Validación de correo
    validarCorreo(correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(correo);
    }

    validarTelefono(telefono) {
        return telefono && telefono.replace(/\D/g, '').length >= 10;
    }
}
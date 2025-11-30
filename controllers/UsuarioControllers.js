import { Usuario } from "../Models/Usuario";
import DatabaseService from "../database/DatabaseService";

export class UsuarioController {

    // Inicializar la base de datos
    async initialize() {
        await DatabaseService.initialize();
    }

    // Registrar usuario
    async registrar(nombre, correo, telefono, contrasena, confirmar) {

        // Validar campos
        Usuario.validarRegistro(nombre, correo, telefono, contrasena, confirmar);

        // Verificar si ya existe
        const existente = await DatabaseService.getByCorreo(correo.trim());
        if (existente) throw new Error("Este correo ya está registrado");

        // Guardar nuevo usuario
        const nuevo = await DatabaseService.add(
            nombre.trim(),
            correo.trim(),
            telefono.trim(),
            contrasena.trim()
        );

        // Convertir a modelo Usuario
        return new Usuario(
            nuevo.id,
            nuevo.nombre,
            nuevo.correo,
            nuevo.telefono,
            nuevo.contrasena,
            nuevo.fechaCreacion
        );
    }

    // Cambiar contraseña
    async cambiarContrasena(nombre, correo, nueva, confirmar) {

        // Validar la nueva contraseña
        Usuario.validarCambio(nueva, confirmar);

        // Buscar por correo
        const usuario = await DatabaseService.getByCorreo(correo.trim());
        if (!usuario) throw new Error("El correo no está registrado");

        if (usuario.nombre !== nombre.trim())
            throw new Error("El nombre no coincide con el correo");

        // Actualizar contraseña
        await DatabaseService.updatePassword(usuario.id, nueva.trim());

        return true;
    }
}

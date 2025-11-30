export class Usuario {
    constructor(id, nombre, correo, telefono, contrasena, fechaCreacion) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.contrasena = contrasena;
        this.fechaCreacion = fechaCreacion || new Date().toISOString();
    }

    // Validación para registrar usuario
    static validarRegistro(nombre, correo, telefono, contrasena, confirmar) {
        if (!nombre || !correo || !telefono || !contrasena || !confirmar)
            throw new Error("Todos los campos son obligatorios");

        if (!correo.includes("@"))
            throw new Error("El correo no es válido");

        if (contrasena !== confirmar)
            throw new Error("Las contraseñas no coinciden");
    }

    // Validación para cambiar contraseña
    static validarCambio(nueva, confirmar) {
        if (!nueva || !confirmar)
            throw new Error("Escribe ambas contraseñas");

        if (nueva !== confirmar)
            throw new Error("Las contraseñas no coinciden");
    }
}

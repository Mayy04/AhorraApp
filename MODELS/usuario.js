// ================================================
// MODELO DEL USUARIO 
// ================================================

export default class Usuario {
  constructor(nombre, correo, telefono, contrasena) {
    this.nombre = nombre;
    this.correo = correo;
    this.telefono = telefono;
    this.contrasena = contrasena;
  }

  // ----------------------------------
  // VALIDACIONES DEL MODELO
  // ----------------------------------
  validar() {
    if (!this.nombre || this.nombre.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }

    if (!this.correo || !this.correo.includes("@")) {
      return "El correo electrónico no es válido.";
    }

    if (!this.telefono || this.telefono.length < 10) {
      return "El número telefónico debe tener mínimo 10 dígitos.";
    }

    if (!this.contrasena || this.contrasena.length < 4) {
      return "La contraseña debe tener mínimo 4 caracteres.";
    }

    return null; // Todo correcto
  }
}
import React, { useState } from 'react';
import {View, Text, Image, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Switch, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilScreen({ route }) {
  const navigation = useNavigation();
  const usuario = route.params?.usuario || { 
    id: 1, 
    nombre: 'Usuario Demo', 
    correo: 'demo@ahorraplus.com',
    telefono: '1234567890'
  };

  // Estado para las preferencias
  const [preferencias, setPreferencias] = useState({
    notificacionesCorreo: true,
    recordatoriosPresupuesto: true,
    resumenSemanal: false,
    alertasGastos: true,
    modoOscuro: false,
    sincronizacionAutomatica: true
  });

  const cerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar Sesión", 
          style: "destructive", 
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'InicioSesion' }],
            });
          }
        },
      ]
    );
  };

  const cambiarPreferencia = (key, value) => {
    setPreferencias(prev => ({
      ...prev,
      [key]: value
    }));
    console.log(`Preferencia ${key} cambiada a:`, value);
  };

  const cambiarContrasena = () => {
    Alert.alert(
      "Cambiar Contraseña",
      "Esta función te llevará a la pantalla de recuperación de contraseña",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Continuar", 
          onPress: () => navigation.navigate('RecuperarContraseña')
        },
      ]
    );
  };

  const exportarDatos = () => {
    Alert.alert(
      "Exportar Datos",
      "¿Deseas exportar tus datos financieros?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Exportar", 
          onPress: () => {
            Alert.alert("Éxito", "Tus datos han sido exportados correctamente");
          }
        },
      ]
    );
  };

  const eliminarCuenta = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "Esta acción es irreversible. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Cuenta Eliminada", "Tu cuenta ha sido eliminada exitosamente");
            navigation.reset({
              index: 0,
              routes: [{ name: 'InicioSesion' }],
            });
          }
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Encabezado */}
          <View style={styles.header}>
            <Image
              source={require('../assets/logoAhorra_2.png')}
              style={styles.logo}
            />
            
            <View style={styles.profileHeader}>
              <Image
                source={require('../assets/Perfil.png')}
                style={styles.avatar}
              />
              <Text style={styles.nombre}>{usuario.nombre}</Text>
              <Text style={styles.correo}>{usuario.correo}</Text>
            </View>
          </View>

          {/* Información Personal */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>
              <Ionicons name="person-outline" size={20} color="#007b4a" /> Información Personal
            </Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={16} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Correo electrónico</Text>
                  <Text style={styles.infoValue}>{usuario.correo}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{usuario.telefono}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Miembro desde</Text>
                  <Text style={styles.infoValue}>Noviembre 2024</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferencias de Notificaciones */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>
              <Ionicons name="notifications-outline" size={20} color="#007b4a" /> Notificaciones
            </Text>
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="mail" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Notificaciones por correo</Text>
                    <Text style={styles.preferenceDescription}>
                      Recibe resúmenes y alertas en tu correo
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.notificacionesCorreo}
                  onValueChange={(value) => cambiarPreferencia('notificacionesCorreo', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.notificacionesCorreo ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="calendar" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Recordatorios de presupuesto</Text>
                    <Text style={styles.preferenceDescription}>
                      Alertas cuando te acerques a tus límites
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.recordatoriosPresupuesto}
                  onValueChange={(value) => cambiarPreferencia('recordatoriosPresupuesto', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.recordatoriosPresupuesto ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="stats-chart" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Resumen semanal</Text>
                    <Text style={styles.preferenceDescription}>
                      Reporte semanal de tus finanzas
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.resumenSemanal}
                  onValueChange={(value) => cambiarPreferencia('resumenSemanal', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.resumenSemanal ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="warning" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Alertas de gastos</Text>
                    <Text style={styles.preferenceDescription}>
                      Notificaciones de transacciones importantes
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.alertasGastos}
                  onValueChange={(value) => cambiarPreferencia('alertasGastos', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.alertasGastos ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Preferencias de la App */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>
              <Ionicons name="settings-outline" size={20} color="#007b4a" /> Configuración de la App
            </Text>
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="moon" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Modo oscuro</Text>
                    <Text style={styles.preferenceDescription}>
                      Interfaz con colores oscuros
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.modoOscuro}
                  onValueChange={(value) => cambiarPreferencia('modoOscuro', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.modoOscuro ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Ionicons name="sync" size={18} color="#007b4a" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Sincronización automática</Text>
                    <Text style={styles.preferenceDescription}>
                      Mantén tus datos actualizados en la nube
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferencias.sincronizacionAutomatica}
                  onValueChange={(value) => cambiarPreferencia('sincronizacionAutomatica', value)}
                  trackColor={{ false: '#f0f0f0', true: '#00A859' }}
                  thumbColor={preferencias.sincronizacionAutomatica ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Acciones de Cuenta */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>
              <Ionicons name="key-outline" size={20} color="#007b4a" /> Acciones de Cuenta
            </Text>
            <View style={styles.accionesContainer}>
              <TouchableOpacity 
                style={styles.accionButton}
                onPress={cambiarContrasena}
              >
                <Ionicons name="key" size={20} color="#007b4a" />
                <Text style={styles.accionButtonText}>Cambiar contraseña</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.accionButton}
                onPress={exportarDatos}
              >
                <Ionicons name="download-outline" size={20} color="#007b4a" />
                <Text style={styles.accionButtonText}>Exportar mis datos</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.accionButton, styles.accionEliminar]}
                onPress={eliminarCuenta}
              >
                <Ionicons name="trash-outline" size={20} color="#D62C1A" />
                <Text style={[styles.accionButtonText, styles.accionEliminarText]}>
                  Eliminar cuenta
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#D62C1A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cerrar Sesión */}
          <TouchableOpacity 
            style={styles.cerrarSesionButton}
            onPress={cerrarSesion}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.cerrarSesionText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          {/* Información de la app */}
          <View style={styles.appInfo}>
            <Image
              source={require('../assets/logoAhorra.png')}
              style={styles.appLogo}
            />
            <Text style={styles.appVersion}>Ahorra+ v1.0.0</Text>
            <Text style={styles.appDescription}>
              Tu compañero financiero personal
            </Text>
            <Text style={styles.appCopyright}>
              © 2024 AhorraPlus. Todos los derechos reservados.
            </Text>
          </View>

          <View style={styles.espacioFinal} />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: height * 0.04,
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007b4a',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  correo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  seccion: {
    width: '90%',
    backgroundColor: '#ffffff',
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007b4a',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoContainer: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  preferencesContainer: {
    gap: 5,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#666',
  },
  accionesContainer: {
    gap: 8,
  },
  accionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  accionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accionEliminar: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe6e6',
  },
  accionEliminarText: {
    color: '#D62C1A',
  },
  cerrarSesionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D62C1A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 25,
    width: '90%',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cerrarSesionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 25,
    padding: 20,
  },
  appLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  appDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  appCopyright: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
  },
  espacioFinal: {
    height: 20,
  },
});

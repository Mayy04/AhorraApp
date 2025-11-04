import{Text, View, TouchableOpacity, Image} from 'react-native'
import { styles } from '../styles.js';
import {useState} from 'react'
import InicioSesionScreen from './InicioSesionScreen';
import RegistroScreen from './RegistroScreen.js';
import RecuperarContraseñaScreen from './RecuperarContraseñaScreen.js';
import PrincipalScreen from './PrincipalScreen.js';
import MetasScreen from './MetasScreen.js';
import PresupuestosScreen from './PresupuestosScreen.js'
import AnalisisScreen from './AnalisisScreen.js';
import PerfilScreen from  './PerfilScreen.js'
import TransaccionesScreen from './TransaccionesScreen.js'

export default function MenuScreen(){
    const [screen, setScreen]=useState('menu');
    switch(screen){
        case 'inicio':
            return <InicioSesionScreen/>;
        case 'registro':
            return <RegistroScreen/>;
        case 'recuperar':
            return <RecuperarContraseñaScreen/>;
        case 'principal':
            return <PrincipalScreen/>;
        case 'metas':
            return <MetasScreen/>
        case 'presupuestos':
            return <PresupuestosScreen/>;
        case 'analisis':
            return <AnalisisScreen/>;
        case 'perfil':
            return <PerfilScreen/>;
        case 'transacciones':
            return <TransaccionesScreen setScreen={setScreen}/>;
        case 'menu':
            default:
                return(
                    <View style={styles.container}>
                        <Image source={require('../assets/logoAhorra.png')} style={styles.logo}/>
                        <View style={styles.container3}>
                        <TouchableOpacity onPress={()=>setScreen('inicio')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Inicio de Sesión</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={()=>setScreen('registro')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Registro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('recuperar')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Recuperar Contraseña</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('metas')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Metas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('presupuestos')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Presupuestos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('analisis')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Análisis</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('perfil')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setScreen('transacciones')} style={styles.botones3}>
                            <Text style={styles.textoBoton}>Transacciones</Text>
                        </TouchableOpacity>

                        </View>                        
                    </View>
                )
    }
}
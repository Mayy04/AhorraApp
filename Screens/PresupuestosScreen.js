import {View, Text, Image, ImageBackground, TouchableOpacity} from 'react-native';
import {styles} from '../styles';
import MenuScreen from './menuScreen';
import { useState } from 'react';

export default function PresupuestosScreen(){
    const [screen, setScreen]=useState('inicio');
    switch(screen){
        case 'regresar':
            return<MenuScreen/>
        case 'inicio':
        default:
    return(
        <View style={styles.container2}>
            <ImageBackground source={require('../assets/fondo.png')}
            style={styles.encabezadoBg}
            resizeMode='stretch'>
                <View style={styles.encabezado}>
                    <TouchableOpacity onPress={()=>setScreen('regresar')}>
                        <Image source={require('../assets/logoAhorra_2.png')}
                    style={styles.logo2}
                    resizeMode='contain'/>
                    </TouchableOpacity>
                    <Text style={styles.texto5}>Presupuestos</Text>
                </View>
            </ImageBackground>
            <View style={styles.container4}>
                <Image source={require('../assets/presupuesto1.png')}
                style={styles.imagen} resizeMode='contain'/>
                <Image source={require('../assets/presupuesto2.png')}
                style={styles.imagen} resizeMode='contain'/>
            </View>
            <Image source={require('../assets/navbar.png')}
            style={styles.navbar}
            resizeMode='contain'/>
        </View>
        )
    }
}
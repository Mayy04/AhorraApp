import { Text, View, Dimensions, TouchableOpacity, TextInput, Image, Switch,
} from 'react-native'
import {styles} from '../styles';
import { useState } from 'react'
import PrincipalScreen from './PrincipalScreen'
import RegistroScreen from './RegistroScreen'
import RecuperarContraseñaScreen from './RecuperarContraseñaScreen'
import MenuScreen from './menuScreen';
 

export default function InicioSesionScreen() {
  const [screen, setScreen] = useState('ingreso');
   const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
 switch(screen){
  case 'inicio':
    return <PrincipalScreen/>;
  case 'olvido':
    return <RecuperarContraseñaScreen/>
  case 'registro':
    return <RegistroScreen/>
  case 'regresar':
    return <MenuScreen/>
  case 'ingreso':
    default:
  return (
        <View style={styles.container}>
        <TouchableOpacity onPress={()=>setScreen('regresar')}>
        <Image source={require('../assets/logoAhorra.png')} style={styles.logo}/>
        </TouchableOpacity>
          <Text style={styles.texto}>AHORRA+</Text>

          <TextInput 
            style={styles.input} 
            placeholder='Usuario'
            value={nombre}
            onChangeText={setNombre}
            maxLength={50}
          />

          <TextInput 
            style={styles.input} 
            placeholder='Contraseña'
            value={correo}
            onChangeText={setCorreo}
            maxLength={50}
          />

         
        <TouchableOpacity   style={styles.botones} onPress={()=>setScreen('inicio')}>
        <Text style={styles.textoBoton}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity   style={styles.botones2} onPress={()=>setScreen('olvido')}>
        <Text style={styles.texto3}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.lineaHorizontal} />
        <Text style={styles.espacioBlanco}>{'\n'}</Text>
        <Text style={styles.texto4}>¿No tienes una cuenta? Registrate ahora.</Text>
        
        <TouchableOpacity   style={styles.botones} onPress={()=>setScreen('registro')}>
        <Text style={styles.textoBoton}>Regisrarse</Text>
        </TouchableOpacity>
        </View>
      
  )
}
}


const { width, height } = Dimensions.get('window');
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrincipalScreen from "./PrincipalScreen";
import TransaccionesScreen from "./TransaccionesScreen";
import PerfilScreen from "./PerfilScreen";
import PresupuestosScreen from "./PresupuestosScreen";
import AnalisisScreen from "./AnalisisScreen";
import MetasScreen from "./MetasScreen";

const Tab = createBottomTabNavigator();

export default function Navbar({ usuario }){
    const insets = useSafeAreaInsets();
    
    // Pasar usuario a todas las pantallas
    const screenOptions = {
        usuario: usuario
    };

    return (
        <Tab.Navigator
            initialRouteName="Principal"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    if (route.name === 'Principal') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Transacciones') {
                        iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Presupuestos') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Análisis') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Metas') {
                        iconName = focused ? 'flag' : 'flag-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#128354',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                    height: 60 + insets.bottom,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: 4,
                },
            })}
        >
            <Tab.Screen 
                name="Principal" 
                component={PrincipalScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen 
                name="Transacciones" 
                component={TransaccionesScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Transacciones' }}
            />
            <Tab.Screen 
                name="Análisis" 
                component={AnalisisScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Análisis' }}
            />
            <Tab.Screen 
                name="Presupuestos" 
                component={PresupuestosScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Presupuestos' }}
            />
            <Tab.Screen 
                name="Metas" 
                component={MetasScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Metas' }}
            />
            <Tab.Screen 
                name="Perfil" 
                component={PerfilScreen}
                initialParams={screenOptions}
                options={{ tabBarLabel: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}

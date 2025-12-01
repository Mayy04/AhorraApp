import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrincipalScreen from "./PrincipalScreen";
import TransaccionesScreen from "./TransaccionesScreen";
import PerfilScreen from "./PerfilScreen";
import PresupuestosScreen from "./PresupuestosScreen";

const Tab = createBottomTabNavigator();

export default function Navbar({ usuario }) {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Principal"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Principal') iconName = 'home';
                    else if (route.name === 'Transacciones') iconName = 'swap-horizontal-sharp';
                    else if (route.name === 'Perfil') iconName = 'person';
                    else if (route.name === 'Presupuestos') iconName = 'calendar';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#128354',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                    height: 60 + insets.bottom,
                },
            })}
        >
            <Tab.Screen name="Principal" component={PrincipalScreen} initialParams={{ usuario }} />
            <Tab.Screen name="Transacciones" component={TransaccionesScreen} initialParams={{ usuario }} />
            <Tab.Screen name="Presupuestos" component={PresupuestosScreen} initialParams={{ usuario }} />
            <Tab.Screen name="Perfil" component={PerfilScreen} initialParams={{ usuario }} />
        </Tab.Navigator>
    );
}

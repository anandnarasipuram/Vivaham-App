import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransportScreen from '../screens/TransportScreen';
import VehicleFormScreen from '../screens/VehicleFormScreen';

const Stack = createNativeStackNavigator();

export default function TransportStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransportList" component={TransportScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddStayScreen from '../screens/AddStayScreen';
import StaysScreen from '../screens/StaysScreen';

const Stack = createNativeStackNavigator();

export default function StaysStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaysList" component={StaysScreen} />
      <Stack.Screen name="AddStay" component={AddStayScreen} />
    </Stack.Navigator>
  );
}

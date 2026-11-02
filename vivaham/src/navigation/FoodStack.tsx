import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddMealScreen from '../screens/AddMealScreen';
import FoodScreen from '../screens/FoodScreen';

const Stack = createNativeStackNavigator();

export default function FoodStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FoodHome" component={FoodScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
    </Stack.Navigator>
  );
}

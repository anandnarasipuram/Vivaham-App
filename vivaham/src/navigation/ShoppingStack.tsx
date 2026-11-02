import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddShoppingItemScreen from '../screens/AddShoppingItemScreen';
import ShoppingScreen from '../screens/ShoppingScreen';

const Stack = createNativeStackNavigator();

export default function ShoppingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingList" component={ShoppingScreen} />
      <Stack.Screen name="AddShoppingItem" component={AddShoppingItemScreen} />
    </Stack.Navigator>
  );
}

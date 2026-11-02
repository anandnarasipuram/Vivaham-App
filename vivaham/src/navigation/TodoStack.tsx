import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddTaskScreen from '../screens/AddTaskScreen';
import TodoScreen from '../screens/TodoScreen';

const Stack = createNativeStackNavigator();

export default function TodoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TodoList" component={TodoScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
}

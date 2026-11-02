import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddRequirementScreen from '../screens/AddRequirementScreen';
import RequirementsListScreen from '../screens/RequirementsListScreen';

const Stack = createNativeStackNavigator();

export default function RequirementsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RequirementsList" component={RequirementsListScreen} />
      <Stack.Screen name="AddRequirement" component={AddRequirementScreen} />
    </Stack.Navigator>
  );
}

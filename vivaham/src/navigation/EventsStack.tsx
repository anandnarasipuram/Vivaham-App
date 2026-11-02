import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventDetailScreen from '../screens/EventDetailScreen';
import EventFormScreen from '../screens/EventFormScreen';
import EventsListScreen from '../screens/EventsListScreen';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsListScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="AddEvent" component={EventFormScreen} />
      <Stack.Screen name="EditEvent" component={EventFormScreen} />
    </Stack.Navigator>
  );
}

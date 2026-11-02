import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddGuestScreen from '../screens/AddGuestScreen';
import GuestsListScreen from '../screens/GuestsListScreen';
import ImportContactsScreen from '../screens/ImportContactsScreen';

const Stack = createNativeStackNavigator();

export default function GuestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuestsList" component={GuestsListScreen} />
      <Stack.Screen name="AddGuest" component={AddGuestScreen} />
      <Stack.Screen name="ImportContacts" component={ImportContactsScreen} />
    </Stack.Navigator>
  );
}

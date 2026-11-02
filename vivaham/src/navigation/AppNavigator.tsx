import { ComponentType } from 'react';
import { Text } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon, { IconName } from '../components/Icon';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useWedding } from '../lib/wedding';
import { colors, fonts } from '../theme';
import BudgetStack from './BudgetStack';
import EventsStack from './EventsStack';
import FoodStack from './FoodStack';
import GuestsStack from './GuestsStack';
import RequirementsStack from './RequirementsStack';
import ShoppingStack from './ShoppingStack';
import StaysStack from './StaysStack';
import TodoStack from './TodoStack';
import TransportStack from './TransportStack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream },
};

const TABS: { name: string; label: string; icon: IconName; component: ComponentType; module?: string }[] = [
  { name: 'Home', label: 'Home', icon: 'home', component: HomeScreen },
  { name: 'Events', label: 'Events', icon: 'calendar', component: EventsStack, module: 'events' },
  { name: 'Guests', label: 'Guests', icon: 'guests', component: GuestsStack, module: 'guests' },
  { name: 'Shopping', label: 'Shopping', icon: 'bag', component: ShoppingStack, module: 'shopping' },
  { name: 'Todo', label: 'To-do', icon: 'check', component: TodoStack, module: 'todo' },
];

const EXTRA_SCREENS: { name: string; component: ComponentType }[] = [
  { name: 'Requirements', component: RequirementsStack },
  { name: 'Budget', component: BudgetStack },
  { name: 'Food', component: FoodStack },
  { name: 'Stays', component: StaysStack },
  { name: 'Transport', component: TransportStack },
  { name: 'Settings', component: SettingsScreen },
];

function Tabs() {
  const { access } = useWedding();
  const tabs = TABS.filter((item) => !item.module || access(item.module) !== 'none');
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.tileBorder,
          borderTopWidth: 1,
        },
      }}
    >
      {tabs.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: 12,
                  fontFamily: focused ? fonts.bold : fonts.semibold,
                }}
              >
                {item.label}
              </Text>
            ),
            tabBarIcon: ({ color }) => <Icon name={item.icon} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        {EXTRA_SCREENS.map((item) => (
          <Stack.Screen key={item.name} name={item.name} component={item.component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { ComponentType } from 'react';
import { Text } from 'react-native';
import { DefaultTheme, LinkingOptions, NavigationContainer, ParamListBase } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon, { IconName } from '../components/Icon';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { APP_URL } from '../lib/config';
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

const linking = {
  prefixes: [...(APP_URL ? [APP_URL] : []), 'vivaham://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: '',
          Events: {
            screens: {
              EventsList: 'events',
              AddEvent: 'events/new',
              EventDetail: 'events/:eventId',
              EditEvent: 'events/:eventId/edit',
            },
          },
          Guests: {
            screens: {
              GuestsList: 'guests',
              AddGuest: 'guests/new',
              ImportContacts: 'guests/import',
              SendMessages: 'guests/messages',
            },
          },
          Shopping: { screens: { ShoppingList: 'shopping', AddShoppingItem: 'shopping/new' } },
          Todo: { screens: { TodoList: 'todo', AddTask: 'todo/new' } },
        },
      },
      Requirements: { screens: { RequirementsList: 'requirements', AddRequirement: 'requirements/new' } },
      Budget: { screens: { BudgetHome: 'budget', AddExpense: 'budget/new' } },
      Food: { screens: { FoodHome: 'food', AddMeal: 'food/new' } },
      Stays: { screens: { StaysList: 'stays', AddStay: 'stays/new' } },
      Transport: { screens: { TransportList: 'transport', VehicleForm: 'transport/vehicle' } },
      Settings: 'settings',
    },
  },
} as LinkingOptions<ParamListBase>;

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
    <NavigationContainer theme={theme} linking={linking} documentTitle={{ formatter: () => 'Vivaham' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        {EXTRA_SCREENS.map((item) => (
          <Stack.Screen key={item.name} name={item.name} component={item.component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

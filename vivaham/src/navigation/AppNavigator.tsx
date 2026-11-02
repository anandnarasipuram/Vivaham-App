import { ComponentType } from 'react';
import { Text } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon, { IconName } from '../components/Icon';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import { colors, fonts } from '../theme';
import EventsStack from './EventsStack';
import GuestsStack from './GuestsStack';
import RequirementsStack from './RequirementsStack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream },
};

const TABS: { name: string; label: string; icon: IconName; component: ComponentType }[] = [
  { name: 'Home', label: 'Home', icon: 'home', component: HomeScreen },
  { name: 'Events', label: 'Events', icon: 'calendar', component: EventsStack },
  { name: 'Guests', label: 'Guests', icon: 'guests', component: GuestsStack },
  { name: 'Shopping', label: 'Shopping', icon: 'bag', component: PlaceholderScreen },
  { name: 'Todo', label: 'To-do', icon: 'check', component: PlaceholderScreen },
];

const EXTRA_SCREENS: { name: string; component: ComponentType }[] = [
  { name: 'Requirements', component: RequirementsStack },
  { name: 'Budget', component: PlaceholderScreen },
  { name: 'Food', component: PlaceholderScreen },
  { name: 'Stays', component: PlaceholderScreen },
];

function Tabs() {
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
      {TABS.map((item) => (
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

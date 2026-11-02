import { ParamListBase, StackActions, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type Nav = NativeStackNavigationProp<ParamListBase>;

export function useNav() {
  return useNavigation<Nav>();
}

export function useParams<T extends object>() {
  return (useRoute().params ?? {}) as Partial<T>;
}

export function goHome(navigation: Nav) {
  navigation.dispatch(StackActions.popTo('Main', { screen: 'Home' }));
}

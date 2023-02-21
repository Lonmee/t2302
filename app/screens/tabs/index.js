/**
 * Created on 22 Nov 2022 by lonmee
 *
 */

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './home';
import Messages from './messages';
import Contacts from './contacts';
import Discover from './discover';
import Profile from './profile';
import {Lan} from '../shared';

const iconSet = {
  Home: 'home',
  Messages: 'mail',
  Contacts: 'people',
  Discover: 'earth',
  Profile: 'settings',
};

export default () => {
  const {Navigator, Screen, Group} = createBottomTabNavigator();
  return (
    <Navigator
      id={'tabs'}
      initialRouteName={'Home'}
      screenOptions={({navigation, route}) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({focused, color, size}) => (
          <Ionicons
            name={iconSet[route.name] + (focused ? '' : '-outline')}
            focused={focused}
            size={size}
            color={color}
          />
        ),
      })}>
      <Group screenOptions={{}}>
        <Screen
          name={'Home'}
          component={Home}
          // options={{title: Lan.t('tabs.Home')}}
        />
        <Screen
          name={'Messages'}
          component={Messages}
          // options={{title: Lan.t('tabs.Messages')}}
        />
        <Screen
          name={'Contacts'}
          component={Contacts}
          // options={{title: Lan.t('tabs.Contacts')}}
        />
        <Screen
          name={'Discover'}
          component={Discover}
          // options={{title: Lan.t('tabs.Discover')}}
        />
        <Screen
          name={'Profile'}
          component={Profile}
          // options={{headerShown: true, title: Lan.t('tabs.Profiles')}}
        />
      </Group>
    </Navigator>
  );
};

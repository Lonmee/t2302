/**
 * Created on 29 Oct 2022 by lonmee
 *
 */
import {StatusBar} from 'react-native';
import {
  PersistWrapper,
  StoreWrapper,
  useBarStyle,
  useTheme,
} from './screens/shared';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Tabs, TempScreen} from './screens';

const App = () => {
  const theme = useTheme(),
    barStyle = useBarStyle();
  const {Navigator, Group, Screen} = createNativeStackNavigator();
  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={barStyle} />
      <Navigator id={'App'} initialRouteName={'Tabs'}>
        <Group screenOptions={{presentation: 'card'}}>
          <Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
          <Screen name="TempScreen" component={TempScreen} />
        </Group>
      </Navigator>
    </NavigationContainer>
  );
};

export default PersistWrapper(StoreWrapper(App));

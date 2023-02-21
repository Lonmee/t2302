/**
 * Created on 23 Nov 2022 by lonmee
 *
 */

import {SafeAreaView, Text} from 'react-native';
import {Lan, StackWrapper, useStyle} from '../../shared';

const Core = () => {
  const {text} = useStyle();
  return (
    <SafeAreaView>
      <Text style={[text]}>This is home</Text>
    </SafeAreaView>
  );
};

export default () => {
  return (
    <StackWrapper
      name={'ContactsWrapper'}
      component={Core}
      options={{
        name: 'HomeWrapper',
        title: Lan.t('tabs.Home'),
        headerLargeTitle: true,
        // headerShadowVisible: false,
        headerTransparent: false,
        headerLargeTitleShadowVisible: true,
        // headerLargeTitleStyle: {fontSize: 24},
        headerSearchBarOptions: {
          onBlur: () => {
            console.log('search blur');
          },
          onSearchButtonPress: event => {
            console.log('search with:', event.nativeEvent.text);
          },
          onChangeText: event => {
            console.log('search text changed with:', event.nativeEvent.text);
          },
          onCancelButtonPress: () => console.log('search canceled'),
        },
      }}
    />
  );
};

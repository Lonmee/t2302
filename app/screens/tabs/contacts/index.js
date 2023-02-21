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
      <Text style={[text]}>This is contacts</Text>
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
        title: Lan.t('tabs.Contacts'),
        headerLargeTitle: true,
        headerTransparent: false,
        headerSearchBarOptions: {
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

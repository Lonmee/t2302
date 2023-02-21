/**
 * Created on 03 Jul 2022 by lonmee
 *
 */

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

export default props => {
  const {Navigator, Screen} = createNativeStackNavigator();
  return (
    <Navigator>
      <Screen {...props} />
    </Navigator>
  );
};

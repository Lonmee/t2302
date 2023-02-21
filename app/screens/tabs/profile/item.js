/**
 * Created on 23 Nov 2022 by lonmee
 *
 */

import {StyleSheet, View, Text} from 'react-native';
import {useStyle} from '../../shared';

export default ({item: {label, data}, index, section}) => {
  const {text} = useStyle(),
    {textStyle} = styles;
  return (
    <View style={[textStyle]}>
      <Text>
        <Text style={[text]}>{label}</Text>
        <Text style={[text]}> : </Text>
        <Text style={[text]}>{data}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    paddingHorizontal: 4,
  },
});

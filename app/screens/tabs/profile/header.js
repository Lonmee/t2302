import {StyleSheet, Text} from 'react-native';
import {useStyle} from '../../shared';

/**
 * Created on 23 Nov 2022 by lonmee
 *
 */

export default ({title}) => {
  const {text, foreground} = useStyle(),
    {textStyle} = styles;
  return <Text style={[text, foreground, textStyle]}>{title}</Text>;
};

const styles = StyleSheet.create({
  textStyle: {
    padding: 4,
    paddingRight: 18,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

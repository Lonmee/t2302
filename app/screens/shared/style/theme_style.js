import {StyleSheet} from 'react-native';
import {BaseColor, darkColors, defaultColors, ExtendColor} from './colors';

/**
 * Created on 31 Oct 2022 by lonmee
 *
 */

const baseStyle = StyleSheet.create({
    primary: {backgroundColor: BaseColor.primary},
    white: {backgroundColor: BaseColor.white},
    lighter: {backgroundColor: BaseColor.lighter},
    light: {backgroundColor: BaseColor.light},
    dark: {backgroundColor: BaseColor.dark},
    darker: {backgroundColor: BaseColor.darker},
    black: {backgroundColor: BaseColor.black},
  }),
  extendStyle = StyleSheet.create({
    universal: {color: ExtendColor.universal},
    textHolder: {color: ExtendColor.textHolder},
  }),
  defaultThemeStyle = StyleSheet.create({
    primary: {backgroundColor: defaultColors.primary},
    background: {backgroundColor: defaultColors.background},
    foreground: {backgroundColor: defaultColors.foreground},
    card: {backgroundColor: defaultColors.card},
    text: {color: defaultColors.text},
    border: {borderColor: defaultColors.border},
    notification: {backgroundColor: defaultColors.notification},
  }),
  darkThemeStyle = StyleSheet.create({
    primary: {backgroundColor: darkColors.primary},
    background: {backgroundColor: darkColors.background},
    foreground: {backgroundColor: darkColors.foreground},
    card: {backgroundColor: darkColors.card},
    text: {color: darkColors.text},
    border: {borderColor: darkColors.border},
    notification: {backgroundColor: darkColors.notification},
  }),
  defaultStyle = StyleSheet.create({
    ...baseStyle,
    ...extendStyle,
    ...defaultThemeStyle,
  }),
  darkStyle = StyleSheet.create({
    ...baseStyle,
    ...extendStyle,
    ...darkThemeStyle,
  });

export {defaultColors, darkColors, defaultStyle, darkStyle};

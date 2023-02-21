/**
 * Created on 29 Oct 2022 by lonmee
 *
 */

import React, {useSyncExternalStore} from 'react';
import Appearance from 'react-native/Libraries/Utilities/Appearance';
import {darkColors, defaultColors} from './colors';
import {DarkTheme, DefaultTheme} from './theme';
import {darkStyle, defaultStyle} from './theme_style';

function useBarStyle() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () =>
      Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content',
  );
}
function useColor() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () => (Appearance.getColorScheme() === 'dark' ? darkColors : defaultColors),
  );
}
function useTheme() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () => (Appearance.getColorScheme() === 'dark' ? DarkTheme : DefaultTheme),
  );
}
function useStyle() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () => (Appearance.getColorScheme() === 'dark' ? darkStyle : defaultStyle),
  );
}

export {useBarStyle, useColor, useTheme, useStyle};

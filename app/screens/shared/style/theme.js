import {darkThemeColors, defaultThemeColors} from './colors';

/**
 * Created on 30 Oct 2022 by lonmee
 * dark (boolean): Whether this is a dark theme or a light theme
 * colors (object): Various colors used by react navigation components:
 * primary (string): The primary color of the app used to tint various elements. Usually you'll want to use your brand color for this.
 * background (string): The color of various backgrounds, such as background color for the screens.
 * card (string): The background color of card-like elements, such as headers, tab bars etc.
 * text (string): The text color of various elements.
 * border (string): The color of borders, e.g. header border, tab bar border etc.
 * notification (string): The color of Tab Navigator badge.
 */
const DefaultTheme = {
    dark: false,
    colors: defaultThemeColors,
  },
  DarkTheme = {
    dark: true,
    colors: darkThemeColors,
  };

export {DefaultTheme, DarkTheme};

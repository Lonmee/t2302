/**
 * Created on 30 Oct 2022 by lonmee
 *
 */

const base = {
    primary: 'rgb(10, 132, 255)',
    white: '#FFF',
    lighter: '#F3F3F3',
    light: '#DAE1E7',
    dark: '#444',
    darker: '#222',
    black: '#000',
  },
  extend = {
    universal: '#868686',
    textHolder: '#8E8E92',
  },
  universalColors = {...base, ...extend},
  defaultTheme = {
    primary: base.primary,
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
  darkTheme = {
    primary: base.primary,
    background: 'rgb(1, 1, 1)',
    card: 'rgb(18, 18, 18)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
  defaultExtend = {
    foreground: base.lighter,
  },
  darkExtend = {
    foreground: base.darker,
  },
  defaultColors = {...universalColors, ...defaultTheme, ...defaultExtend},
  darkColors = {...universalColors, ...darkTheme, ...darkExtend};

export {
  base as BaseColor,
  extend as ExtendColor,
  defaultTheme as defaultThemeColors,
  darkTheme as darkThemeColors,
  defaultColors,
  darkColors,
};

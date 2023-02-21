/**
 * Created on 25 Jun 2022 by lonmee
 *
 */

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getLanguages} from 'react-native-i18n';
import {Lan} from '../../screens/shared';

export const getLanguage = createAsyncThunk(
  'settings/getLanguage',
  async () => {
    const languages = await getLanguages();
    return languages[0];
  },
);

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    language: Lan.locale,
    themeAuto: true,
  },
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleThemeAuto: (state, action) => {
      state.themeAuto = !state.themeAuto;
    },
    reset: (state, action) => settingsSlice.getInitialState(),
  },
  extraReducers: builder => {
    builder.addCase(getLanguage.fulfilled, (state, action) => {
      state.language = action.payload;
    });
  },
});

export const {changeLanguage, toggleThemeAuto, reset} = settingsSlice.actions;

export default settingsSlice.reducer;

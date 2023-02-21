/**
 * Created on 15 Dec 2022 by lonmee
 *
 */

import {combineReducers} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import settingsReducer from './settingsSlice';
import runtimeReducer from './runtimeSlice';

export default combineReducers({
  user: userReducer,
  settings: settingsReducer,
  runtime: runtimeReducer,
});

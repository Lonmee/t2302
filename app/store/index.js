/**
 * Created on 25 Jun 2022 by lonmee
 */

import React from 'react';
import {configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer from './features';
import {version as appVersion} from '../app.json';
import infoLog from 'react-native/Libraries/Utilities/infoLog';
import {Lan} from '../screens/shared';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['home', 'runtime'],
  version: appVersion,
};

/**
 *     serializableCheck: {
 *       // Ignore these action types
 *       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
 *       // Ignore these field paths in all actions
 *       ignoredActionPaths: ['runtime/pullMenu', 'feed/addSummary'],
 *       // Ignore these paths in the state
 *       ignoredPaths: ['runtime/pullMenu', 'feed/summary'],
 *     },
 * @param getDefaultMiddleware
 */
const middleware = getDefaultMiddleware =>
  __DEV__
    ? getDefaultMiddleware({
        serializableCheck: false,
      }).concat(require('redux-flipper').default())
    : getDefaultMiddleware({
        serializableCheck: false,
      });
const store = configureStore({
  reducer: persistReducer(persistConfig, reducer),
  middleware: middleware,
  devTools: __DEV__,
});

/**
 * system listener for app state
 */
function stateHandler() {
  const {language, dark, ssbEnabled, ssbRawMsg} = store.getState().settings;

  Lan.locale === language || (Lan.locale = language);
}

const persist = persistStore(store, {manualPersist: false}, () => {
  store.subscribe(stateHandler);
  stateHandler();
  infoLog('rehydration finished with: ', store.getState());
});

export {persist, store};

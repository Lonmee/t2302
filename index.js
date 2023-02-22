/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app';
import {name as appName, clientName} from './app/app.json';
import {initHandler} from './app/remote/ssb';

AppRegistry.registerComponent(appName, () => App);

// ssb client
AppRegistry.registerRunnable(clientName, initHandler);
AppRegistry.runApplication(clientName, {});

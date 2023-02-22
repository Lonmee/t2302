/**
 * Created on 15 Dec 2022 by lonmee
 *
 */
import nodejs from 'nodejs-mobile-react-native';
import {log} from '../../utils';

export * from './store';

export function initHandler(params) {
  const {start, channel} = nodejs;
  channel.addListener('log4RN', logHandler);
  start('index.js');
}

function logHandler(msg) {
  log('node log', msg);
}

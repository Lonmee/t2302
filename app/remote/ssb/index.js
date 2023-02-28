/**
 * Created on 15 Dec 2022 by lonmee
 *
 */
import nodejs from 'nodejs-mobile-react-native';
import ssbClient from 'react-native-ssb-client';
import {log} from '../../utils';
import manifest from './manifest';
import consumer from 'ssb-deweird';
import cachedAboutSelf from './plugin/cachedAboutSelf';
import hooks from './plugin/hooks';
import publishUtils from './plugin/publishUtils';
import threadsUtils from './plugin/threadsUtils';
import starter from './plugin/Starter';

export * from './store';

const {start, channel} = nodejs;

export function initHandler(params) {
  channel.addListener('log4RN', logHandler);
  start('index.js');
}

function logHandler(msg) {
  log('node log', msg);
}

export function callSSB(msg) {
  return new Promise((resolve, reject) => {
    channel.post('identity', msg);
    channel.addListener('identity', msg => {
      switch (msg) {
        case 'IDENTITY_READY':
          ssbClient(manifest)
            .use(consumer)
            .use(cachedAboutSelf)
            .use(hooks)
            .use(publishUtils)
            .use(threadsUtils)
            .use(starter)
            .call(null, (err, ssb) => {
              err ? reject(err) : resolve(ssb);
            });
          break;
        case 'IDENTITY_CLEARED':
          resolve(msg);
          break;
        default:
          reject(msg);
      }
    });
  });
}

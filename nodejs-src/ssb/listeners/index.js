/**
 * Created on 10 Aug 2022 by lonmee
 *
 */
const {restore, migrate, clear} = require('../identity');
const {dev} = require('../utils');

let ssb;
module.exports = ({channel}, start) => {
  channel.on('identity', async request => {
    let response;
    switch (request) {
      case 'CREATE':
      case 'USE':
        if (ssb) {
          return channel.post('log4RN', 'ssb already ran');
        }
        ssb = await start(request === 'CREATE');
        break;
      case 'MIGRATE':
        migrate(async () => {
          ssb = await start(false);
        });
        break;
      case 'CLEAR':
        ssb &&
          ssb.close(true, () => {
            clear(() => {
              ssb = null;
            });
          });
        channel.post('identity', 'IDENTITY_CLEARED');
        break;
      default:
        if (request.startsWith('RESTORE:')) {
          response = restore(request.split('RESTORE: ')[1].trim());
          response === 'IDENTITY_READY' && (ssb = await start(false));
        } else {
          return;
        }
    }
    dev && ((global.ssb = ssb), console.log("now working in dev mode and 'ssb(global.ssb)' available"));
    channel.post('identity', response || 'IDENTITY_READY');
  });
};

/**
 * Created on 15 Jul 2022 by lonmee
 *
 */

const {dev, rnBridge} = require('./ssb/utils');
// node initializing
require('./node/initializer');

// start ssb
require('./ssb');
const fs = require('fs');

// client simulator
if (dev) {
  rnBridge.channel.trigger(
    'identity',
    fs.existsSync(process.env.SSB_DIR) ? 'USE' : 'CREATE',
  );
  setTimeout(
    () =>
      ssb.conn
        .start()
        .then(() =>
          ssb.replicationScheduler.start(() =>
            console.log('replicationScheduler start'),
          ),
        ),
    500,
  );
  // xxx: to test clear
  // setTimeout(() => rnBridge.channel.trigger('identity', 'CLEAR'), 1000);
}

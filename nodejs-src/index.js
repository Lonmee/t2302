/**
 * Created on 15 Jul 2022 by lonmee
 *
 */

const {dev, res, rnBridge} = require('./ssb/utils');
// node initializing
require('./node/initializer');
// start ssb
require('./ssb');
const {pull} = require("pull-stream");

// client simulator
if (dev) {
    const fs = require('fs');
    rnBridge.channel.trigger(
        'identity',
        res ? 'RESTORE: ring work system space certain flip onion urge fit alcohol luggage brass rubber truck place correct copy bicycle suffer kitchen space refuse mango picnic' :
            fs.existsSync(process.env.SSB_DIR) ? 'USE' : 'CREATE',
    );
    setTimeout(
        () => {
            if (res) {
                // resync
                ssb.conn.start().then(() => {
                    // join room
                    // ssb.conn.remember('net:110.41.150.47:8008~shs:txCEJ1+BWW37gZKX7b2B8GcbrZm9bwDbeRV/VkZNVwg=', {type: 'room'}, console.log)
                    ssb.ebt.request(
                        '@+LtEZKFCnrM1g3fDiFJIH4fTX9hmPkx3lihtzxLFFQQ=.ed25519',
                        true,
                        null,
                        e => e && console.error(e.message || e),
                    );
                    pull(ssb.resyncUtils.progress(), pull.unique(), pull.drain(v => console.log('progress: ', v)));
                })
            } else {
                // normal
                ssb.conn.start().then(() =>
                    ssb.replicationScheduler.start(() =>
                        console.log('replicationScheduler start'),
                    ),
                );
                ssb.suggest.start((e, v) =>
                    e ? console.error(e) : console.log('ssb client', 'suggest.start'),
                );
                ssb.friendsPurge.start((e, v) =>
                    e ? console.error(e) : console.log('ssb client', 'friendsPurge.start'),
                );
            }
        },
        500,
    );
    // xxx: to test clear
    // setTimeout(() => rnBridge.channel.trigger('identity', 'CLEAR'), 1000);
}

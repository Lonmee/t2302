/**
 * Created on 10 Aug 2022 by lonmee
 *
 */

const listeners = require('./listeners');
const config = require('./config');
const SecretStack = require('secret-stack');
const {rnBridge} = require('./utils');
const oneTimeFixes = require('./one-time-fixes');

listeners(rnBridge, start);

async function start(isNewIdentity) {
  try {
    await oneTimeFixes();
  } catch (e) {}
  const ssbConfig = config(isNewIdentity);
  ssbConfig.connections.incoming.net.push({
    scope: 'local',
    transform: 'shs',
    port: 26831,
  });
  return (
    SecretStack(ssbConfig)
      // Core
      .use(require('ssb-master'))
      .use(require('ssb-db2'))
      .use(require('ssb-db2/compat/db'))
      .use(require('ssb-db2/compat/ebt'))
      .use(require('ssb-db2/compat/log-stream'))
      .use(require('ssb-db2/compat/history-stream'))
      .use(require('ssb-deweird/producer'))
      // Replication
      .use(require('ssb-ebt')) // needs: db2/compat
      .use(require('ssb-friends')) // needs: db2
      .use(require('ssb-replication-scheduler')) // needs: friends, ebt
      // Connections
      .use(require('./plugins/multiserver-addons'))
      .use(require('ssb-lan'))
      .use(require('./plugins/bluetooth'))
      .use(require('ssb-conn')) // needs: db2, friends, lan, bluetooth
      .use(require('ssb-conn-firewall')) // needs: friends
      .use(require('ssb-room-client')) // needs: conn
      .use(require('ssb-http-auth-client')) // needs: conn
      .use(require('ssb-http-invite-client'))
      .use(require('ssb-invite-client')) // needs: db2, conn
      // Queries
      .use(require('ssb-about-self')) // needs: db2
      .use(require('ssb-suggest-lite')) // needs: db2, about-self, friends
      .use(require('ssb-threads')) // needs: db, db2, friends
      .use(require('ssb-db2/full-mentions')) // needs: db2
      .use(require('ssb-search2')) // needs: db2
      // Blobs
      .use(require('ssb-blobs'))
      .use(require('ssb-serve-blobs')) // needs: blobs
      .use(require('ssb-blobs-blurhash')) // needs: blobs
      .use(require('ssb-blobs-purge')) // needs: blobs, db2/full-mentions
      // Storage
      .use(require('ssb-storage-used')) // needs: db2
      .use(require('ssb-friends-purge')) // needs: db2, friends
      // Customizations
      .use(require('./plugins/blobsUtils')) // needs: blobs
      .use(require('./plugins/connUtils')) // needs: conn, aboutSelf
      .use(require('./plugins/aliasUtils')) // needs: db2
      .use(require('./plugins/resyncUtils')) // needs: db2, connFirewall
      .use(require('./plugins/publishUtilsBack')) // needs: db, blobs, blobsUtils
      .use(require('./plugins/searchUtils')) // needs: db2
      .use(require('./plugins/gatheringsUtils')) // needs: db2
      .use(require('./plugins/keysUtils'))
      .use(require('./plugins/settingsUtils')) // needs: blobs-purge, conn-firewall
      .use(require('./plugins/dbUtils')) // needs: db2, syncing, friends
      .use(require('./plugins/votes')) // needs: db2
      .call()
  );
}

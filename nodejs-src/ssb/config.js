/**
 * Created on 11 Aug 2022 by lonmee
 *
 */
const makeConfig = require('ssb-config/inject');
const caps = require('ssb-caps');
const ssbKeys = require('ssb-keys');
const path = require('path');

module.exports = isNewIdentity => {
  const KEYS_PATH = path.join(process.env.SSB_DIR, 'secret');
  const keys = ssbKeys.loadOrCreateSync(KEYS_PATH);
  return makeConfig('ssb', {
    caps,
    keys,
    path: process.env.SSB_DIR,
    db2: {
      maxCpu: 91, // %
      maxCpuWait: 80, // ms
      maxCpuMaxPause: 120, // ms
      automigrate: true,
      dangerouslyKillFlumeWhenMigrated: true,
      // For new users that have just created an identity, only try to decrypt
      // messages created recently (1 week ago) to speed up onboarding:
      startDecryptBox1: isNewIdentity
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        : null,
    },
    blobs: {
      sympathy: 2,
    },
    blobsPurge: {
      cpuMax: 90, // %
    },
    serveBlobs: {
      port: 26833, //26834, //26835
    },
    conn: {
      autostart: false,
      firewall: {
        rejectBlocked: true,
        rejectUnknown: false,
      },
    },
    friends: {
      hops: 2,
      hookAuth: false, // because we use ssb-conn-firewall
    },
    replicationScheduler: {
      autostart: false,
      partialReplication: null,
    },
    suggest: {
      autostart: false,
    },
    connections: {
      incoming: {
        net: [
          {scope: 'public', transform: 'shs', port: 8008},
        ],
        channel: [{scope: 'device', transform: 'noauth'}],
        bluetooth: [{scope: 'public', transform: 'shs'}],
        tunnel: [{scope: 'public', transform: 'shs'}],
      },
      outgoing: {
        net: [{transform: 'shs'}],
        ws: [{transform: 'shs'}],
        bluetooth: [{scope: 'public', transform: 'shs'}],
        tunnel: [{transform: 'shs'}],
      },
    },
  });
};

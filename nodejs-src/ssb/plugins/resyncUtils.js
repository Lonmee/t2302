module.exports = {
  name: 'resyncUtils',
  version: '1.0.0',
  manifest: {
    progress: 'source',
    enableFirewall: 'sync',
  },
  permissions: {
    master: {
      allow: ['progress', 'enableFirewall'],
    },
  },
  init(ssb, config) {
    // Disable conn firewall to allow "strangers" to connect and resync data
    ssb.getVectorClock((err, clock) => {
      if (err) {
        return console.error('resyncUtils exception', err);
      }
      if (!clock) {
        return console.error('resyncUtils missing clock', clock);
      }
      if (clock[ssb.id]) {
        return;
      } // we are not resyncing, apparently

      // Our feed is empty, so temporarily disable firewall for strangers
      ssb.connFirewall.reconfigure({rejectUnknown: false});
    });

    return {
      progress() {
        return function progressSource(errOrEnd, cb) {
          if (errOrEnd) {
            return cb(errOrEnd);
          }
          const timeout = setTimeout(() => {
            const stats = ssb.db.getStatus().value;
            cb(null, stats.log);
          }, 500);
          timeout.unref();
        };
      },

      enableFirewall() {
        ssb.connFirewall.reconfigure({
          rejectUnknown: config.conn.firewall.rejectUnknown || true,
        });
      },
    };
  },
};

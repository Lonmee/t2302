const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const FILENAME = 'manyverse-settings.json';
const DETAILED_LOGS = 'DETAILED_LOGS';

function writeSync(data) {
  if (!process.env.SSB_DIR) {
    throw new Error('writeSync needs the SSB_DIR env var');
  }
  if (!fs.existsSync(process.env.SSB_DIR)) {
    mkdirp.sync(process.env.SSB_DIR);
  }

  const filePath = path.join(process.env.SSB_DIR, FILENAME);
  try {
    const content = JSON.stringify(data);
    fs.writeFileSync(filePath, content, {encoding: 'ascii'});
  } catch (err) {
    console.error(err);
  }
}

function readSync() {
  if (!process.env.SSB_DIR) {
    throw new Error('readSync needs the SSB_DIR env var');
  }
  if (!fs.existsSync(process.env.SSB_DIR)) {
    mkdirp.sync(process.env.SSB_DIR);
  }

  const filePath = path.join(process.env.SSB_DIR, FILENAME);
  let settings;

  try {
    const content = fs.readFileSync(filePath, {encoding: 'ascii'});
    settings = JSON.parse(content);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
    settings = {};
  }

  if (fs.existsSync(path.join(process.env.SSB_DIR, DETAILED_LOGS))) {
    settings.detailedLogs = true;
  } else {
    settings.detailedLogs = false;
  }
  return settings;
}

function writeDetailedLogs(detailedLogs) {
  if (!process.env.SSB_DIR) {
    throw new Error('writeSync needs the SSB_DIR env var');
  }
  if (!fs.existsSync(process.env.SSB_DIR)) {
    mkdirp.sync(process.env.SSB_DIR);
  }
  const filePath = path.join(process.env.SSB_DIR, DETAILED_LOGS);
  try {
    if (detailedLogs) {
      fs.writeFileSync(filePath, '1', {encoding: 'ascii'});
    } else {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
}

function updateField(key, value) {
  const prev = readSync();
  const next = {...prev, [key]: value};
  writeSync(next);
}

module.exports = {
  name: 'settingsUtils',
  version: '1.0.0',
  manifest: {
    read: 'sync',
    updateHops: 'sync',
    updateBlobsPurge: 'sync',
    updateShowFollows: 'sync',
    updateEnableFirewall: 'sync',
    updateDetailedLogs: 'sync',
    updateAllowCheckingNewVersion: 'sync',
  },
  permissions: {
    master: {
      allow: [
        'read',
        'updateHops',
        'updateBlobsPurge',
        'updateShowFollows',
        'updateDetailedLogs',
        'updateAllowCheckingNewVersion',
      ],
    },
  },

  readSync,

  init: function init(ssb, _config) {
    if (!ssb.blobsPurge.start) {
      throw new Error(
        '"settingsUtils" is missing required plugin "ssb-blobs-purge"',
      );
    }

    if (!ssb.connFirewall) {
      throw new Error(
        '"settingsUtils" is missing required plugin "ssb-conn-firewall"',
      );
    }

    // TODO: this logic could be moved to the frontend, and the storage of
    // the settings could be put in React Native's async-storage, as long as
    // we have a "global component" in cycle-native-navigation
    const current = readSync();
    let initialTimeout;
    const storageLimit = current.blobsStorageLimit || 500e6;
    if (storageLimit >= 0) {
      initialTimeout = setTimeout(() => {
        ssb.blobsPurge.start({storageLimit});
      }, 30e3);
      initialTimeout.unref();
    }

    return {
      updateHops(hops) {
        updateField('hops', hops);
      },

      updateShowFollows(showFollows) {
        // TODO: like above, this could also be moved to the frontend
        updateField('showFollows', showFollows);
      },

      updateEnableFirewall(enableFirewall) {
        ssb.connFirewall.reconfigure({
          rejectUnknown: enableFirewall,
        });
        updateField('enableFirewall', enableFirewall);
      },

      updateBlobsPurge(storageLimit) {
        // TODO: like above, this could also be moved to the frontend
        if (initialTimeout) {
          clearTimeout(initialTimeout);
          initialTimeout = void 0;
        }
        if (storageLimit >= 0) {
          ssb.blobsPurge.start({storageLimit});
          updateField('blobsStorageLimit', storageLimit);
        } else {
          ssb.blobsPurge.stop();
          updateField('blobsStorageLimit', void 0);
        }
      },

      updateDetailedLogs(detailedLogs) {
        writeDetailedLogs(detailedLogs);
      },

      updateAllowCheckingNewVersion(allowCheckingNewVersion) {
        updateField('allowCheckingNewVersion', allowCheckingNewVersion);
      },

      read() {
        return readSync();
      },
    };
  },
};

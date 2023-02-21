/**
 * Created on 10 Aug 2022 by lonmee
 *
 */

const path = require('path');
const os = require('os');
const {rnBridge, dev} = require('../../ssb/utils');
const {app, channel} = rnBridge;

// listeners
if (dev) {
  app.on('pause', pauseLock => {
    channel.post('log4RN', 'app paused.');
    pauseLock.release();
  });
  app.on('resume', () => {
    channel.post('log4RN', 'app resumed.');
  });
}

// path
const appDataDir = (process.env.APP_DATA_DIR = app.datadir());
process.env.SSB_DIR = path.resolve(appDataDir, '.ssb');
const nodejsProjectDir = path.resolve(appDataDir, 'nodejs-project');
os.homedir = process.cwd = () => nodejsProjectDir;

channel.post('log4RN', `ssb initialized @ ${app.datadir()}`);

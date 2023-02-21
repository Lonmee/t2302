const path = require('path');
const fs = require('fs');
const util = require('util');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const BIPF = require('bipf');
const defaults = require('ssb-db2/defaults');
const AAOL = require('async-append-only-log');

if (!process.env.SSB_DIR) {
  throw new Error('misconfigured SSB_DIR in the backend');
}
const SSB_DIR = process.env.SSB_DIR;
const KEYS_PATH = path.join(SSB_DIR, 'secret');
const OLD_LOG_PATH = defaults.oldLogPath(SSB_DIR);
const NEW_LOG_PATH = defaults.newLogPath(SSB_DIR);

async function deleteDuplicateRecordsOnLog() {
  const log = AAOL(NEW_LOG_PATH, {
    blockSize: defaults.BLOCK_SIZE,
    validateRecord: data => {
      try {
        BIPF.decode(data, 0);
        return true;
      } catch (ex) {
        return false;
      }
    },
  });

  const B_KEY = Buffer.from('key');
  const existing = new Set();
  const deletables = new Set();

  // Find deletables
  await new Promise(resolve => {
    log.stream({gt: -1}).pipe({
      paused: false,
      write: function (record) {
        const buffer = record.value;
        if (!buffer) {
          return;
        }
        const pKey = BIPF.seekKey(buffer, 0, B_KEY);
        const shortKey = BIPF.decode(buffer, pKey).slice(1, 33);
        if (existing.has(shortKey)) {
          deletables.add(record.offset);
        } else {
          existing.add(shortKey);
        }
      },
      end: () => {
        resolve();
      },
    });
  });

  const del = util.promisify(log.del);
  for (const offset of deletables) {
    await del(offset);
  }

  existing.clear();
  deletables.clear();
}

function moveJitIndexes() {
  const files = fs.readdirSync(defaults.indexesPath(SSB_DIR));
  for (const file of files) {
    if (file === 'canDecrypt.index') {
      continue;
    } // not a jitdb index
    if (file === 'encrypted.index') {
      continue;
    } // not a jitdb index
    if (
      file.endsWith('.index') ||
      file.endsWith('.32prefix') ||
      file.endsWith('.32prefixmap')
    ) {
      const origin = path.join(defaults.indexesPath(SSB_DIR), file);
      const destination = path.join(defaults.jitIndexesPath(SSB_DIR), file);
      fs.renameSync(origin, destination);
    }
  }
}

/**
 * One-time fixes for special issues.
 *
 * Sometimes things go wrong in the database and we need to reset indexes or
 * others to make the database work again, but only once. This file accounts for
 * all those cases, and each of these "issues" refers to GitLab issue codes.
 */
async function oneTimeFixes() {
  const ISSUE_1223 = path.join(SSB_DIR, 'issue1223');
  if (!fs.existsSync(ISSUE_1223) && fs.existsSync(OLD_LOG_PATH)) {
    rimraf.sync(path.join(SSB_DIR, 'db2'));
    fs.closeSync(fs.openSync(ISSUE_1223, 'w'));
  }

  const ISSUE_1328 = path.join(SSB_DIR, 'issue1328');
  if (!fs.existsSync(ISSUE_1328)) {
    rimraf.sync(defaults.indexesPath(SSB_DIR) + '/*.*');
    fs.closeSync(fs.openSync(ISSUE_1328, 'w'));
  }

  const ISSUE_1486 = path.join(SSB_DIR, 'issue1486');
  if (!fs.existsSync(ISSUE_1486)) {
    rimraf.sync(defaults.indexesPath(SSB_DIR) + '/!(*.*)');
    fs.closeSync(fs.openSync(ISSUE_1486, 'w'));
  }

  // Fix issue #1518:
  if (fs.existsSync(KEYS_PATH) && fs.lstatSync(KEYS_PATH).isDirectory()) {
    const keysPathWrong = path.join(KEYS_PATH, 'secret');
    const keysPathTmp = path.join(SSB_DIR, 'tmpsecret');
    fs.renameSync(keysPathWrong, keysPathTmp);
    rimraf.sync(KEYS_PATH);
    fs.renameSync(keysPathTmp, KEYS_PATH);
  }

  const ISSUE_1628 = path.join(SSB_DIR, 'issue1628');
  if (!fs.existsSync(ISSUE_1628)) {
    rimraf.sync(defaults.indexesPath(SSB_DIR));
    fs.closeSync(fs.openSync(ISSUE_1628, 'w'));
    await deleteDuplicateRecordsOnLog();
  }

  const ISSUE_1707 = path.join(SSB_DIR, 'issue1707');
  if (!fs.existsSync(ISSUE_1707)) {
    rimraf.sync(defaults.indexesPath(SSB_DIR));
    fs.closeSync(fs.openSync(ISSUE_1707, 'w'));
  }

  const ISSUE_2045 = path.join(SSB_DIR, 'issue2045');
  if (!fs.existsSync(ISSUE_2045)) {
    rimraf.sync(defaults.jitIndexesPath(SSB_DIR));
    fs.closeSync(fs.openSync(ISSUE_2045, 'w'));
  }

  // https://github.com/ssb-ngi-pointer/ssb-db2/blob/master/CHANGELOG.md#400
  if (
    fs.existsSync(defaults.indexesPath(SSB_DIR)) &&
    !fs.existsSync(defaults.jitIndexesPath(SSB_DIR))
  ) {
    mkdirp.sync(defaults.jitIndexesPath(SSB_DIR));
    moveJitIndexes();
  }

  const ISSUE_2086 = path.join(SSB_DIR, 'issue2086');
  if (!fs.existsSync(ISSUE_2086)) {
    const idxs = defaults.indexesPath(SSB_DIR);
    // rename canDecrypt.index to decrypted.index
    const decryptedPathBad = path.join(idxs, 'canDecrypt.index');
    const decryptedPathGood = path.join(idxs, 'decrypted.index');
    if (fs.existsSync(decryptedPathBad)) {
      fs.renameSync(decryptedPathBad, decryptedPathGood);
    }
    // rename encrypted.index to encrypted-box2.index
    const encryptedBox2PathBad = path.join(idxs, 'encrypted.index');
    const encryptedBox2PathGood = path.join(idxs, 'encrypted-box2.index');
    if (fs.existsSync(encryptedBox2PathBad)) {
      fs.renameSync(encryptedBox2PathBad, encryptedBox2PathGood);
    }
    fs.closeSync(fs.openSync(ISSUE_2086, 'w'));
  }

  const ISSUE_2101 = path.join(SSB_DIR, 'issue2101');
  if (!fs.existsSync(ISSUE_2101)) {
    rimraf.sync(defaults.indexesPath(SSB_DIR));
    rimraf.sync(defaults.jitIndexesPath(SSB_DIR));
    fs.closeSync(fs.openSync(ISSUE_2101, 'w'));
  }
}

module.exports = oneTimeFixes;

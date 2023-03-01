/**
 * Created on 11 Aug 2022 by lonmee
 *
 */

const dev = process.argv.includes('--dev');
const res = process.argv.includes('--res');
const rnBridge = require(dev ? '../rn-bridge-proxy' : 'rn-bridge');
module.exports = {dev, res, rnBridge};

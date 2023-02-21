/**
 * Created on 10 Jan 2023 by lonmee
 *
 */
process.env.DEBUG = '*';
process.argv.push('--dev');
require('../index');
console.log("now 'ssb(global.ssb)' available");

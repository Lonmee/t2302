/**
 * Created on 10 Jan 2023 by lonmee
 *
 */
process.env.DEBUG = '*';
process.argv.push('--dev');
// restore switcher
// process.argv.push('--res');
require('../index');

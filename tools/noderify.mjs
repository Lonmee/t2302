#!/usr/bin/env node

import {exec} from 'child_process';

exec(
    'noderify ./nodejs-src/index.js > ./nodejs-assets/nodejs-project/index.js --filter=bufferutil --filter=utf-8-validate',
);

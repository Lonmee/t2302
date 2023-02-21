#!/usr/bin/env node

import util from 'util';
import ora from 'ora';
import childProcess from 'child_process';

const exec = util.promisify(childProcess.exec);
const loading = ora('...').start();
const verbose = !!process.argv.includes('--verbose');
const targetPlatform = process.argv.includes('--ios')
    ? 'ios'
    : process.argv.includes('--desktop')
        ? 'desktop'
        : 'android';

async function runAndReport(label, task) {
  const now = Date.now();
  try {
    loading.start(label);
    let {stdout, stderr} = await task;
  } catch (err) {
    loading.fail();
    if (verbose) {
      console.error(stderr);
    }
    console.error(err.stack);
    process.exit(err.code);
  }
  const duration = Date.now() - now;
  const durationLabel =
      duration < 1000
          ? duration + ' milliseconds'
          : duration < 60000
              ? (duration * 0.001).toFixed(1) + ' seconds'
              : ((duration * 0.001) / 60).toFixed(1) + ' minutes';
  loading.succeed(
      `${label}${duration >= 1000 ? ' (' + durationLabel + ')' : ''}`,
  );
  if (verbose) {
    console.log(stdout);
  }
}

(async function() {
  await runAndReport(
    "Move source project to ./nodejs-assets",
    exec("./tools/move-to-nodejs-assets.sh"),
  );

  if (targetPlatform === "ios") {
    await runAndReport(
      "Install backend node modules",
      exec("~/.nvm/versions/node/v16.17.0/bin/npm install --omit=optional --ignore-scripts", {
        cwd: "./nodejs-assets/nodejs-project",
        env: {
          PLATFORM_NAME: "iphoneos",
          DONT_COMPILE: '1',
          ...process.env,
        },
      }),
    );
  } else {
    await runAndReport(
      "Install backend node modules",
      exec("~/.nvm/versions/node/v16.17.0/bin/npm install --omit=optional --ignore-scripts", {
        env: {
          DONT_COMPILE: '1',
          ...process.env,
        },
        cwd: "./nodejs-assets/nodejs-project",
      }),
    );
  }

  await runAndReport(
    'Apply patches to node modules',
    exec('npm run apply-patches', {
      cwd: './nodejs-assets/nodejs-project',
    }),
  );

  await runAndReport(
    "Update package-lock.json in ./nodejs-src",
    exec(
      "cp ./nodejs-assets/nodejs-project/package-lock.json " +
      "./nodejs-src/package-lock.json",
    ),
  );

  await runAndReport(
    "Pre-remove files not necessary for Android nor iOS",
    exec("./tools/pre-remove-unused-files.sh"),
  );

  if (targetPlatform === "android") {
    await runAndReport(
      "Build native modules for Android armeabi-v7a and arm64-v8a",
      exec("./tools/build-native-modules.sh", {
        maxBuffer: 4 * 1024 * 1024 /* 4MB worth of logs in stdout */,
      }),
    );
  }

  if (targetPlatform === "android") {
    await runAndReport(
      "Post-remove files not necessary for Android",
      exec("./tools/post-remove-unused-files.sh"),
    );
  }

  await runAndReport(
    "Bundle and minify backend JS into one file",
    exec("./tools/noderify.js --mobile"),
  );

  if (targetPlatform === "android") {
    await runAndReport(
      "Move some shared dynamic native libraries to Android jniLibs",
      exec("./tools/move-shared-libs-android.sh"),
    );

    await runAndReport(
      "Remove node_modules folder from the Android project",
      exec(
        "rm -rf ./nodejs-assets/nodejs-project/node_modules && " +
        "rm -rf ./nodejs-assets/nodejs-project/patches &&" +
        "rm ./nodejs-assets/nodejs-project/package-lock.json",
      ),
    );
  }
})();

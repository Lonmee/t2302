#!/usr/bin/env node

import util from "util";
import ora from "ora";
import childProcess from "child_process";

const exec = util.promisify(childProcess.exec);
const loading = ora("...").start();
const verbose = !!process.argv.includes("--verbose");
const targetPlatform = process.argv.includes("--ios")
  ? "ios"
  : "android";

async function runAndReport(label, task) {
  const now = Date.now();
  try {
    loading.start(label);
    var { stdout, stderr } = await task;
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
      ? duration + " milliseconds"
      : duration < 60000
        ? (duration * 0.001).toFixed(1) + " seconds"
        : ((duration * 0.001) / 60).toFixed(1) + " minutes";
  loading.succeed(
    `${label}${duration >= 1000 ? " (" + durationLabel + ")" : ""}`,
  );
  if (verbose) {
    console.log(stdout);
  }
}

(async function() {
  await runAndReport(
    "Bundle and minify backend JS into one file",
    exec("./tools/noderify.js --mobile"),
  );
})();

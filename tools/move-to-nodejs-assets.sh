#!/bin/bash

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

mkdir -p ./nodejs-assets/nodejs-project
rm -rf ./nodejs-assets/nodejs-project
if [ -f ./nodejs-assets/BUILD_NATIVE_MODULES.txt ]; then
  echo -en " Build Native Modules already on"
else
  echo '1' >./nodejs-assets/BUILD_NATIVE_MODULES.txt
  echo -en " Build Native Modules turned on"
fi
mkdir -p ./nodejs-assets/nodejs-project
mkdir -p ./nodejs-assets/nodejs-project/patches;
cp ./nodejs-src/patches/* ./nodejs-assets/nodejs-project/patches/;
cp ./nodejs-src/package.json ./nodejs-assets/nodejs-project
cp ./nodejs-src/package-lock.json ./nodejs-assets/nodejs-project

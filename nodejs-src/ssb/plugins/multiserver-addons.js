// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const noauthTransformPlugin = require('multiserver/plugins/noauth');
const wsTransportPlugin = require('multiserver/plugins/ws');
const {rnBridge} = require('../utils');

module.exports = function multiserverAddons(ssb, cfg) {
  ssb.multiserver.transform({
    name: 'noauth',
    create: () =>
      noauthTransformPlugin({
        keys: {publicKey: Buffer.from(cfg.keys.public, 'base64')},
      }),
  });

  ssb.multiserver.transport({
    name: 'ws',
    create: () => wsTransportPlugin({}),
  });

  try {
    const rnChannelPlugin = require('multiserver-rn-channel');
    ssb.multiserver.transport({
      name: 'channel',
      create: () => rnChannelPlugin(rnBridge.channel),
    });
  } catch (err) {}
};

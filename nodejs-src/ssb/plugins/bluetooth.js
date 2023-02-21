const makeMultiservPlugin = require('multiserver-bluetooth-rp');
const BluetoothRepeater = require('ssb-bluetooth-repeater');
const {rnBridge} = require('../utils');
/**
 * A plugin for bluetooth functionality. Initialises a multiserve plugin
 * for managing connections, and exposes some mux-rpc functions for bluetooth
 * functionality (such as scanning for nearby devices, making your device discoverable)
 *
 * @param {*} bluetoothRepeater an instance of a bluetooth manager that implements the platform
 *                             specific (e.g. android or PC) bluetooth functionality.
 *                             See ssb-mobile-bluetooth-manager for an example.
 */
module.exports = {
  name: 'bluetooth',
  version: '1.0.0',
  init: stack => {
    const opts = {scope: 'public'};

    const bluetoothRepeater = BluetoothRepeater({
      rnBridge,
      myIdent: '@' + stack.id,
      metadataServiceUUID: 'b4721184-46dc-4314-b031-bf52c2b197f3',
      controlPort: 20310,
      incomingPort: 20311,
      outgoingPort: 20312,
      logStreams: false,
    });

    const plugin = {
      name: 'bluetooth',
      create: () => {
        return makeMultiservPlugin({
          bluetoothRepeater: bluetoothRepeater,
          scope: opts ? opts.scope : null,
        });
      },
    };

    stack.multiserver.transport(plugin);

    return {
      nearbyDevices: refreshInterval => {
        return bluetoothRepeater.nearbyDevices(refreshInterval);
      },
      nearbyScuttlebuttDevices: refreshInterval => {
        return bluetoothRepeater.nearbyScuttlebuttDevices(refreshInterval);
      },
      bluetoothScanState: () => {
        return bluetoothRepeater.bluetoothScanState();
      },
      makeDeviceDiscoverable: (forTime, cb) => {
        bluetoothRepeater.makeDeviceDiscoverable(forTime, cb);
      },
      isEnabled: cb => {
        bluetoothRepeater.isEnabled(cb);
      },
      getMetadataForDevice: (deviceAddress, cb) => {
        bluetoothRepeater.getMetadataForDevice(deviceAddress, cb);
      },
    };
  },
  manifest: {
    nearbyDevices: 'source',
    nearbyScuttlebuttDevices: 'source',
    bluetoothScanState: 'source',
    makeDeviceDiscoverable: 'async',
    isEnabled: 'async',
    getMetadataForDevice: 'async',
  },
};

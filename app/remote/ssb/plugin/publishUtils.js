const noop = () => {};

export default {
  name: 'publishUtils',

  init: ssb => {
    return {
      publish(content, cb = noop) {
        ssb.hooks.publish({
          timestamp: Date.now(),
          value: {
            timestamp: Date.now(),
            author: ssb.id,
            content,
          },
        });

        // TODO: temporary hack until we fix issue #1256 properly
        setTimeout(() => {
          ssb.publishUtilsBack.publish(content, cb || noop);
        }, 60);
      },

      publishAbout(content, cb) {
        ssb.publishUtilsBack.publishAbout(content, cb);
      },
    };
  },
};

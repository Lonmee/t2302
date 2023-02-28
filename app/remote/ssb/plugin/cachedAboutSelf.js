import QuickLRU from 'quick-lru';

export default {
  name: 'cachedAboutSelf',
  version: '1.0.0',
  manifest: {
    invalidate: 'sync',
    getNameAndImage: 'async',
  },
  permissions: {
    master: {
      allow: ['invalidate', 'get'],
    },
  },

  init: ssb => {
    const DUNBAR = 150;
    const cache = new QuickLRU({maxSize: DUNBAR});
    const cacheV2K = [];

    function isValid(out) {
      if (!out) {
        return false;
      }
      if (!out.name && !out.image) {
        return false;
      }
      return true;
    }

    return {
      invalidate(id) {
        cache.delete(id);
      },

      get(id, cb) {
        if (cache.has(id)) {
          cb(null, cache.get(id));
        } else {
          ssb.aboutSelf.get(id, (err, out) => {
            if (!err && isValid(out)) {
              cache.set(id, out);
              const findIndex = cacheV2K.findIndex(item => item[1] === id);
              if (findIndex === -1) {
                cacheV2K.push([out.name, id]);
              } else {
                cacheV2K[findIndex] = [out.name, id];
              }
            }
            cb(err, out);
          });
        }
      },

      getKeysByName(name, cb) {
        cb(
          null,
          cacheV2K
            .filter(([n, k]) => n && n.includes(name))
            .map(([_, key]) => key),
        );
      },
    };
  },
};

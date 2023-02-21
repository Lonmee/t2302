const ssbKeys = require('ssb-keys');
const Ref = require('ssb-ref');

module.exports = {
  name: 'publishUtilsBack',
  version: '1.0.0',
  manifest: {
    publish: 'async',
    publishAbout: 'async',
  },
  permissions: {
    master: {
      allow: ['publish', 'publishAbout'],
    },
  },
  init: function init(ssb) {
    if (!ssb.blobs.push) {
      throw new Error(
        '"publishUtilsBack" is missing required plugin "ssb-blobs"',
      );
    }
    if (!ssb.blobsUtils.addFromPath) {
      throw new Error(
        '"publishUtilsBack" is missing required plugin "blobsUtils"',
      );
    }

    return {
      publish(content, cb) {
        if (content) {
          for (const mention of content.mentions) {
            if (Ref.isBlob(mention.link)) {
              ssb.blobs.push(mention.link, err => {
                if (err) {
                  console.error(err);
                }
              });
            }
          }
        }
        if (content.recps) {
          try {
            content = ssbKeys.box(
              content,
              content.recps
                .map(e =>
                  Ref.isFeed(e) ? e : Ref.isFeed(e.link) ? e.link : void 0,
                )
                .filter(x => !!x),
            );
          } catch (e) {
            return cb(e);
          }
        }

        ssb.publish(content, (err, msg) => {
          if (err) {
            console.error(err);
          }
          if (cb) {
            cb(err, msg);
          }
        });
      },

      publishAbout(content, cb) {
        if (content.image && !Ref.isBlobId(content.image[0])) {
          ssb.blobsUtils.addFromPath(content.image, (err, hash) => {
            if (err) {
              return console.error(err);
            }
            content.image = hash;
            ssb.publish(content, (err2, msg) => {
              if (err2) {
                console.error(err2);
              }
              if (cb) {
                cb(err2, msg);
              }
            });
          });
        } else {
          ssb.publish(content, (err, msg) => {
            if (err) {
              console.error(err);
            }
            if (cb) {
              cb(err, msg);
            }
          });
        }
      },
    };
  },
};

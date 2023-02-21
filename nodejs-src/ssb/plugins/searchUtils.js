const pull = require('pull-stream');
const {
  where,
  and,
  type,
  isPublic,
  descending,
  batch,
  toPullStream,
} = require('ssb-db2/operators');

module.exports = {
  name: 'searchUtils',
  version: '1.0.0',
  manifest: {
    query: 'source',
  },
  permissions: {
    master: {
      allow: ['query'],
    },
  },
  init: function init(ssb) {
    const containsWords = ssb.search2.operator;

    return {
      query(text) {
        return pull(
          ssb.db.query(
            where(and(type('post'), isPublic(), containsWords(text))),
            descending(),
            batch(20),
            toPullStream(),
          ),
          pull.filter(msg =>
            // We want to make sure that *exact* input is matched, *not* as a
            // word prefix, so we use a word boundary, except not literally `\b`
            // because it often doensn't work with Unicode (especially in
            // nodejs-mobile!), so we do this instead:
            new RegExp(text + '($|[ ,.;:!?\\-])', 'i').test(
              msg.value.content.text,
            ),
          ),
          pull.asyncMap((msg, cb) => {
            ssb.friends.isBlocking(
              {source: ssb.id, dest: msg.value.author},
              (err, blocking) => {
                if (err || blocking) {
                  cb(null, null);
                } else {
                  cb(null, msg);
                }
              },
            );
          }),
          pull.filter(),
        );
      },
    };
  },
};

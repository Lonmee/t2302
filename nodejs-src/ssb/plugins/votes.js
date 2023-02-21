const pull = require('pull-stream');
const ref = require('ssb-ref');
const {where, votesFor, live, toPullStream} = require('ssb-db2/operators');

const THUMBS_UP_UNICODE = '\ud83d\udc4d';

function collectUniqueAuthors() {
  const theMap = new Map();
  return function sink(read) {
    const outputSource = (abort, cb) => {
      read(abort, function next(endOrErr, msg) {
        if (endOrErr) {
          cb(endOrErr);
          return;
        }
        if (
          !msg ||
          msg.sync ||
          !msg.value.content ||
          msg.value.content.type !== 'vote' ||
          !msg.value.content.vote
        ) {
          read(abort, next);
          return;
        }

        const author = msg.value.author;
        const voteValue = msg.value.content.vote.value;
        const voteExpression =
          msg.value.content.vote.expression || THUMBS_UP_UNICODE;
        if (voteValue < 1 && theMap.has(author)) {
          theMap.delete(author);
        } else if (voteValue >= 1) {
          // this delete is used on purpose, to reset the insertion order
          theMap.delete(author);
          theMap.set(author, voteExpression);
        } else {
          read(abort, next);
          return;
        }
        cb(endOrErr, [...theMap]);
      });
    };
    return outputSource;
  };
}

module.exports = {
  name: 'votes',
  version: '1.0.0',
  manifest: {
    voterStream: 'source',
  },
  permissions: {
    master: {
      allow: ['voterStream'],
    },
  },
  init: function init(ssb) {
    return {
      voterStream(msgId) {
        if (!ref.isLink(msgId)) {
          throw new Error('A message id must be specified');
        }
        return pull(
          ssb.db.query(
            where(votesFor(msgId)),
            live({old: true}),
            toPullStream(),
          ),
          collectUniqueAuthors(),
        );
      },
    };
  },
};

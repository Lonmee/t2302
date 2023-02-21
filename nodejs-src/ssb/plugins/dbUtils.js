const pull = require('pull-stream');
const pullAsync = require('pull-async');
const cat = require('pull-cat');
const bipf = require('bipf');

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const DIG_UNICODE = '\u270c\ufe0f';
const HEART_UNICODE = '\u2764\ufe0f';

function voteExpressionToReaction(expression) {
  const lowCase = expression.toLowerCase();
  if (lowCase === 'like') {
    return THUMBS_UP_UNICODE;
  }
  if (lowCase === 'yup') {
    return THUMBS_UP_UNICODE;
  }
  if (lowCase === 'heart') {
    return HEART_UNICODE;
  }
  if (lowCase === 'dig') {
    return DIG_UNICODE;
  }
  if (expression.codePointAt(0) === 0x270c) {
    return DIG_UNICODE;
  }
  if (expression) {
    return expression;
  }
  return THUMBS_UP_UNICODE;
}

function isValidVoteMsg(msg) {
  if (!msg) {
    return false;
  }
  if (!msg.value) {
    return false;
  }
  if (!msg.value.content) {
    return false;
  }
  if (!msg.value.content.vote) {
    return false;
  }
  if (!msg.value.content.vote.expression) {
    return false;
  }
  if (!msg.value.content.vote.value) {
    return false;
  }
  if (typeof msg.value.content.vote.value !== 'number') {
    return false;
  }
  if (isNaN(msg.value.content.vote.value)) {
    return false;
  }
  return msg.value.content.vote.value >= 0;
}

function isValidChannelSubscribeMsg(msg) {
  if (!msg) {
    return false;
  }
  if (!msg.value) {
    return false;
  }
  if (!msg.value.content) {
    return false;
  }
  if (!msg.value.content.channel) {
    return false;
  }
  if (typeof msg.value.content.channel !== 'string') {
    return false;
  }
  if (typeof msg.value.content.subscribed !== 'boolean') {
    return false;
  }
  return true;
}

const B_CONTENT = Buffer.from('content');
const B_RECPS = Buffer.from('recps');

function seekRecps(buffer, start, pValue) {
  if (pValue < 0) {
    return -1;
  }
  const pValueContent = bipf.seekKey(buffer, pValue, B_CONTENT);
  if (pValueContent < 0) {
    return -1;
  }
  return bipf.seekKey(buffer, pValueContent, B_RECPS);
}

function hasTwoRecps(predicate) {
  return predicate(
    seekRecps,
    recps => Array.isArray(recps) && recps.length === 2,
    {
      indexType: 'value_content_recps',
      name: 'length2',
    },
  );
}

module.exports = {
  name: 'dbUtils',
  version: '1.0.0',
  manifest: {
    warmUpJITDB: 'sync',
    rawLogReversed: 'source',
    mentionsMe: 'source',
    postsCount: 'async',
    preferredReactions: 'source',
    selfPublicRoots: 'source',
    selfPublicReplies: 'source',
    selfPrivateRootIdsLive: 'source',
    friendsInCommon: 'async',
    snapshotAbout: 'async',
    latestPrivateChatWith: 'async',
    hashtagsSubscribed: 'source',
  },
  permissions: {
    master: {
      allow: [
        'warmUpJITDB',
        'rawLogReversed',
        'mentionsMe',
        'postsCount',
        'preferredReactions',
        'selfPublicRoots',
        'selfPublicReplies',
        'selfPrivateRootIdsLive',
        'friendsInCommon',
        'snapshotAbout',
        'hashtagsSubscribed',
        'latestPrivateChatWith',
      ],
    },
  },
  init: function init(ssb) {
    const {
      where,
      or,
      and,
      not,
      type,
      live: liveOperator,
      author,
      contact,
      votesFor,
      about,
      fullMentions: mentions,
      isRoot,
      hasRoot,
      hasFork,
      isPublic,
      isPrivate,
      predicate,
      descending,
      batch,
      count,
      toPullStream,
      toCallback,
    } = ssb.db.operators;

    const BATCH_SIZE = 100; // about 50 KB per batch

    const subscribedHashtags = {
      _set: new Set(),
      isEmpty() {
        return this._set.size === 0;
      },
      update(msg) {
        if (!isValidChannelSubscribeMsg(msg)) {
          return;
        }
        const {channel, subscribed} = msg.value.content;
        const sanitizedChannel = channel.startsWith('#')
          ? channel.slice(1).toLocaleLowerCase()
          : channel.toLocaleLowerCase();

        if (subscribed) {
          this._set.add(sanitizedChannel);
        } else {
          this._set.delete(sanitizedChannel);
        }
      },
      toArray(sort) {
        const result = Array.from(this._set);
        return sort ? result.sort((a, b) => a.localeCompare(b)) : result;
      },
    };

    const reactionsCount = {
      _map: new Map(),
      isEmpty() {
        return this._map.size === 0;
      },
      update(msg) {
        if (!isValidVoteMsg(msg)) {
          return;
        }
        const {expression} = msg.value.content.vote;
        const reaction = voteExpressionToReaction(expression);
        const previous = this._map.get(reaction) || 0;
        this._map.set(reaction, previous + 1);
      },
      toArray() {
        return [...this._map.entries()]
          .sort((a, b) => b[1] - a[1]) // sort by descending count
          .map(x => x[0]); // pick the emoji string
      },
    };

    /**
     * Eagerly build some indexes to make the UI progress bar more stable.
     * (Knowing up-front all the "work" that has to be done makes it easier to
     * know how much work is left to do.) We always need these indexes anyway.
     */
    function warmUpJITDB() {
      const eagerIndexes = or(
        // meta_encryptionFormat_box.index:
        isPrivate('box'),
        // meta_.index:
        isPublic(),
        // meta_private_true.index:
        isPrivate(),
        // value_author.32prefix:
        author(ssb.id, {dedicated: false}),
        // value_author_@SELFSSBID.index:
        author(ssb.id, {dedicated: true}),
        // value_content_about__map.32prefixmap:
        // value_content_type_about.index:
        about(ssb.id),
        // value_content_contact__map.32prefixmap
        // value_content_type_contact.index:
        contact(ssb.id),
        // value_content_fork__map.32prefixmap
        hasFork('whatever'),
        // value_content_recps__pred_length2.index:
        hasTwoRecps(predicate),
        // value_content_root_.index
        isRoot(),
        // value_content_root__map.32prefixmap
        hasRoot('whatever'),
        // value_content_type_gathering.index:
        type('gathering'),
        // value_content_type_post.index
        type('post'),
        // value_content_type_pub.index
        type('pub'),
        // value_content_type_roomx2Falias.index
        type('room/alias'),
        // value_content_type_vote.index:
        // value_content_vote_link__map.32prefixmap:
        votesFor('whatever'),
      );
      ssb.db.prepare(eagerIndexes, () => {});
    }

    warmUpJITDB(); // call it ASAP

    return {
      warmUpJITDB,

      rawLogReversed() {
        return ssb.db.query(descending(), batch(BATCH_SIZE), toPullStream());
      },

      mentionsMe(opts) {
        return pull(
          ssb.db.query(
            where(
              and(
                isPublic(),
                or(and(type('post'), mentions(ssb.id)), contact(ssb.id)),
              ),
            ),
            descending(),
            opts.live ? liveOperator({old: opts.old}) : null,
            batch(BATCH_SIZE),
            toPullStream(),
          ),
          pull.filter(msg => {
            // Allow all posts
            if (msg.value.content.type === 'post') {
              return true;
            }
            // Only allow "followed" msgs
            if (msg.value.content.type === 'contact') {
              const content = msg.value.content;
              const blocking = content.flagged || content.blocking;
              const following = content.following;
              return blocking === undefined && following === true;
            }
            // Disallow unexpected cases
            return false;
          }),
          pull.map(msg => (opts.live ? msg.key : msg)),
        );
      },

      postsCount(cb) {
        ssb.db.query(
          where(and(isPublic(), type('post'))),
          count(),
          toCallback(cb),
        );
      },

      hashtagsSubscribed() {
        return cat([
          // First return all hashtags subscribed
          subscribedHashtags.isEmpty()
            ? pullAsync(cb => {
                pull(
                  ssb.db.query(
                    where(
                      and(type('channel'), author(ssb.id, {dedicated: true})),
                    ),
                    toPullStream(),
                  ),
                  pull.drain(
                    msg => {
                      subscribedHashtags.update(msg);
                    },
                    err => {
                      if (err) {
                        cb(err);
                      } else {
                        cb(null, subscribedHashtags.toArray());
                      }
                    },
                  ),
                );
              })
            : pull.values([subscribedHashtags.toArray()]),

          // Then update subscribed hashtags when the user (un)subscribes from a hashtag
          pull(
            ssb.db.query(
              where(and(type('channel'), author(ssb.id, {dedicated: true}))),
              liveOperator({old: false}),
              toPullStream(),
            ),
            pull.map(msg => {
              subscribedHashtags.update(msg);
              return subscribedHashtags.toArray();
            }),
          ),
        ]);
      },

      preferredReactions() {
        return cat([
          // First deliver latest preferred reactions
          reactionsCount.isEmpty()
            ? pullAsync(cb => {
                ssb.db.query(
                  where(and(type('vote'), author(ssb.id, {dedicated: true}))),
                  toCallback((err, msgs) => {
                    if (err) {
                      return cb(err);
                    }
                    for (const msg of msgs) {
                      reactionsCount.update(msg);
                    }
                    cb(null, reactionsCount.toArray());
                  }),
                );
              })
            : pull.values([reactionsCount.toArray()]),

          // Then update preferred reactions when the user creates a vote
          pull(
            ssb.db.query(
              where(and(type('vote'), author(ssb.id, {dedicated: true}))),
              liveOperator({old: false}),
              toPullStream(),
            ),
            pull.map(msg => {
              reactionsCount.update(msg);
              return reactionsCount.toArray();
            }),
          ),
        ]);
      },

      selfPublicRoots(opts) {
        return ssb.db.query(
          where(
            and(
              author(ssb.id, {dedicated: true}),
              type('post'),
              isPublic(),
              isRoot(),
            ),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPublicReplies(opts) {
        return ssb.db.query(
          where(
            and(
              author(ssb.id, {dedicated: true}),
              type('post'),
              isPublic(),
              not(isRoot()),
            ),
          ),
          opts.live ? liveOperator({old: opts.old}) : null,
          toPullStream(),
        );
      },

      selfPrivateRootIdsLive() {
        return pull(
          ssb.db.query(
            where(
              and(
                author(ssb.id, {dedicated: true}),
                type('post'),
                isPrivate(),
                isRoot(),
              ),
            ),
            liveOperator({old: false}),
            toPullStream(),
          ),
          pull.map(msg => msg.key),
        );
      },

      friendsInCommon(feedId, cb) {
        if (feedId === ssb.id) {
          return cb(null, []);
        }

        ssb.friends.hops({start: ssb.id, reverse: false}, (err, myHops) => {
          if (err) {
            return cb(err);
          }

          ssb.friends.hops(
            {start: feedId, reverse: true, max: 1},
            (err, theirHops) => {
              if (err) {
                return cb(err);
              }
              const common = [];
              for (const id in theirHops) {
                if (theirHops[id] === 1 && myHops[id] === 1) {
                  common.push(id);
                }
              }
              return cb(null, common);
            },
          );
        });
      },

      snapshotAbout(feedId, cb) {
        let returned = false;
        pull(
          ssb.db.query(
            where(and(author(ssb.id), contact(feedId))),
            descending(),
            toPullStream(),
          ),
          pull.drain(
            msg => {
              if (returned) {
                return false;
              }
              if (msg.value.content.blocking && msg.value.content.about) {
                returned = true;
                cb(null, msg.value.content.about);
                return false; // abort the drain
              }
            },
            err => {
              if (err && err !== true) {
                console.error('error running ssb.dbUtils.snapshotAbout:', err);
              }
              if (!returned) {
                returned = true;
                cb(null, {});
              }
            },
          ),
        );
      },

      latestPrivateChatWith(feedId, cb) {
        pull(
          ssb.db.query(
            where(and(type('post'), isPrivate('box'), hasTwoRecps(predicate))),
            descending(),
            batch(500),
            toPullStream(),
          ),
          pull.filter(msg => {
            const recps = msg.value.content && msg.value.content.recps;
            if (!recps) {
              return false;
            }
            if (!Array.isArray(recps)) {
              return false;
            }
            if (recps.length !== 2) {
              return false;
            }
            if (!recps.find(r => r === ssb.id || r.link === ssb.id)) {
              return false;
            }
            if (!recps.find(r => r === feedId || r.link === feedId)) {
              return false;
            }
            return true;
          }),
          pull.take(1),
          pull.collect((err, msgs) => {
            if (err) {
              return cb(err);
            }
            if (msgs.length === 0) {
              return cb(null, null);
            }
            const msg = msgs[0];
            cb(null, msg.value.content.root || msg.key);
          }),
        );
      },
    };
  },
};

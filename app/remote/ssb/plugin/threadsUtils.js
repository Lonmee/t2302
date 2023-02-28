import xs from 'xstream';
import xsFromCallback from 'xstream-from-callback';
import xsFromPullStream from 'xstream-from-pull-stream';
import pull from 'pull-stream';
import Ref from 'ssb-ref';
import {isContactMsg, isGatheringMsg, isMsg} from 'ssb-typescript/utils';
import run from 'promisify-tuple';

import {imageToImageUrl, voteExpressionToReaction} from '../utils/from-ssb';

function getRecipient(recp) {
  if (typeof recp === 'object' && Ref.isFeed(recp.link)) {
    return recp.link;
  }
  if (typeof recp === 'string' && Ref.isFeed(recp)) {
    return recp;
  }
}

function mutateMsgWithLiveExtras(
  ssb,
  options = {
    includeReactions: true,
    includeGatheringInfo: true,
  },
) {
  return async (msg, cb) => {
    if (!(isMsg(msg) || isGatheringMsg(msg)) || !msg.value) {
      return cb(null, msg);
    }

    // Fetch name and image
    const id = msg.value.author;
    const [, output] = await run(ssb.cachedAboutSelf.get)(id);
    const name = output.name;
    const imageUrl = imageToImageUrl(output.image);

    // Get reactions stream
    const reactions = options.includeReactions
      ? createReaction$(ssb, msg)
      : xs.never();

    const gatheringAttendees = isGatheringMsg(msg)
      ? createGatheringAttendees$(ssb, msg)
      : undefined;

    // Get gathering info stream
    const gatheringInfo =
      options.includeGatheringInfo && isGatheringMsg(msg)
        ? createGatheringInfo$(ssb, msg)
        : undefined;

    // Create msg object
    const m = msg;
    m.value._$manyverse$metadata = m.value._$manyverse$metadata || {
      reactions,
      gatheringInfo,
      gatheringAttendees,
      about: {name, imageUrl},
    };

    // Add name of the target contact, if any
    const content = msg.value.content;
    if (!content || content.type !== 'contact' || !content.contact) {
      return cb(null, m);
    }
    const dest = content.contact;
    const [, destOutput] = await run(ssb.cachedAboutSelf.get)(dest);
    m.value._$manyverse$metadata.contact = {name: destOutput.name};
    cb(null, m);
  };
}

function mutateThreadWithLiveExtras(ssb) {
  return async (thread, cb) => {
    for (const msg of thread.messages) {
      await run(mutateMsgWithLiveExtras(ssb))(msg);
    }
    cb(null, thread);
  };
}

function mutateThreadSummaryWithLiveExtras(ssb) {
  return async (summary, cb) => {
    await run(mutateMsgWithLiveExtras(ssb))(summary.root);
    cb(null, summary);
  };
}

function mutatePrivateThreadWithLiveExtras(ssb) {
  return async (thread, cb) => {
    for (const msg of thread.messages) {
      await run(
        mutateMsgWithLiveExtras(ssb, {
          includeReactions: false,
          includeGatheringInfo: false,
        }),
      )(msg);
    }
    const root = thread.messages[0];
    const pvthread = thread;
    if (root && root?.value?.content?.recps) {
      pvthread.recps = [];
      for (const recp of root?.value?.content?.recps) {
        const id = getRecipient(recp);
        if (!id) {
          continue;
        }

        // Fetch name and image
        const [, output] = await run(ssb.cachedAboutSelf.get)(id);
        const name = output.name;
        const imageUrl = imageToImageUrl(output.image);

        // Push
        pvthread.recps.push({id, name, imageUrl});
      }
    }
    cb(null, pvthread);
  };
}

function createGatheringAttendees$(ssb, msg) {
  return xsFromPullStream(ssb.gatheringsUtils.gatheringAttendees(msg.key))
    .map(gatheringAttendees => {
      const attendeesInfo$ = gatheringAttendees.map(feedId =>
        xsFromCallback(ssb.cachedAboutSelf.get)(feedId).map(response => ({
          feedId,
          name: response.name,
          avatarUrl: imageToImageUrl(response.image),
        })),
      );

      return xs.combine(...attendeesInfo$);
    })
    .flatten()
    .remember();
}

function createGatheringInfo$(ssb, msg) {
  return xsFromCallback(ssb.gatheringsUtils.gatheringInfo)(msg.key).remember();
}

function createReaction$(ssb, msg) {
  return xsFromPullStream(ssb.votes.voterStream(msg.key))
    .startWith([])
    .map(arr =>
      arr
        .reverse() // recent ones first
        .map(([feedId, expression]) => {
          const reaction = voteExpressionToReaction(expression);
          return [feedId, reaction];
        }),
    );
}

const ALLOW_ALL = ['post', 'gathering', 'contact'];
const ALLOW_ALL_EXCEPT_CONTACT = ['post', 'gathering'];
const ALLOW_POSTS_ONLY = ['post'];

export default {
  name: 'threadsUtils',

  init: function init(ssb) {
    if (!ssb.settingsUtils?.read) {
      throw new Error(
        '"threadsUtils" is missing required plugin "settingsUtils"',
      );
    }
    if (!ssb.dbUtils?.rawLogReversed) {
      throw new Error('"threadsUtils" is missing required plugin "dbUtils"');
    }

    const privateAllowlist = ALLOW_POSTS_ONLY;
    let publicAllowlist = ALLOW_POSTS_ONLY;

    // TODO: this could be in a "global component" in cycle-native-navigation
    ssb.settingsUtils.read((err, settings) => {
      if (err) {
        console.error(err);
      } else if (settings.showFollows === false) {
        publicAllowlist = ALLOW_ALL_EXCEPT_CONTACT;
      }
    });

    return {
      updateShowFollows(showFollows) {
        publicAllowlist = showFollows ? ALLOW_ALL : ALLOW_ALL_EXCEPT_CONTACT;
      },

      publicRawFeed() {
        return pull(
          ssb.deweird.source(['dbUtils', 'rawLogReversed']),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      publicFeed(opts) {
        return pull(
          ssb.deweird.source(['threads', 'publicSummary'], {
            allowlist: publicAllowlist,
            ...opts,
          }),
          pull.filter(summary => {
            if (isContactMsg(summary.root)) {
              // Only accept blocking or unblocking messages
              const content = summary.root?.value?.content;
              return (
                typeof content.blocking === 'boolean' &&
                typeof content.following !== 'boolean'
              );
            } else {
              return true;
            }
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      publicUpdates() {
        return ssb.threads.publicUpdates({
          includeSelf: true,
          allowlist: publicAllowlist,
        });
      },

      hashtagFeed(hashtag) {
        return pull(
          ssb.deweird.source(['threads', 'hashtagSummary'], {
            allowlist: ALLOW_ALL_EXCEPT_CONTACT,
            hashtag,
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      privateFeed(opts) {
        return pull(
          ssb.deweird.source(['threads', 'private'], {
            threadMaxSize: 1,
            allowlist: privateAllowlist,
            ...opts,
          }),
          pull.asyncMap(mutatePrivateThreadWithLiveExtras(ssb)),
        );
      },

      privateUpdates() {
        return ssb.threads.privateUpdates({
          allowlist: privateAllowlist,
          includeSelf: true,
        });
      },

      mentionsFeed() {
        return pull(
          ssb.deweird.source(['dbUtils', 'mentionsMe'], {
            old: true,
            live: false,
          }),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      searchPublicPosts(text, cb) {
        return pull(
          ssb.deweird.source(['searchUtils', 'query'], text),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      selfPublicRoots(opts) {
        return pull(
          ssb.dbUtils.selfPublicRoots(opts),
          pull.map(root => ({root, replyCount: 0})),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      selfReplies(opts) {
        return pull(
          ssb.dbUtils.selfPublicReplies(opts),
          pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
        );
      },

      profileFeed(id, opts) {
        return pull(
          ssb.deweird.source(['threads', 'profileSummary'], {
            id,
            reverse: true,
            live: false,
            threadMaxSize: 3,
            allowlist: publicAllowlist,
            ...opts,
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      threadUpdates(opts) {
        return pull(
          ssb.threads.threadUpdates(opts),
          pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
        );
      },

      rehydrateLiveExtras(msg, cb) {
        if (!isMsg(msg) || !msg.value) {
          return cb(new Error('not a msg'));
        }
        if (!msg.value._$manyverse$metadata) {
          return cb(new Error('missing live extras metadata'));
        }

        msg.value._$manyverse$metadata.reactions = createReaction$(ssb, msg);

        msg.value._$manyverse$metadata.gatheringAttendees = isGatheringMsg(msg)
          ? createGatheringAttendees$(ssb, msg)
          : undefined;

        msg.value._$manyverse$metadata.gatheringInfo = isGatheringMsg(msg)
          ? createGatheringInfo$(ssb, msg)
          : undefined;
        cb(null, msg);
      },

      thread(opts, cb) {
        /**
         * Necessary because the pull-stream "end" happens after "data",
         * in the drain(), and we don't want to override data with "Not Found".
         */
        let answered = false;

        pull(
          ssb.threads.thread(opts),
          // pull.asyncMap((t, cb2) => {
          //   if (opts.private) {
          //     mutatePrivateThreadWithLiveExtras(ssb)(t, cb2);
          //   } else {
          //     mutateThreadWithLiveExtras(ssb)(t, cb2);
          //   }
          // }),
          pull.take(1),
          pull.drain(
            thread => {
              if (answered) {
                return;
              }
              answered = true;
              cb(null, thread);
            },
            err => {
              if (answered) {
                return;
              }
              answered = true;
              if (err) {
                cb(err);
              } else {
                cb(new Error('Not Found'));
              }
            },
          ),
        );
      },
    };
  },
};

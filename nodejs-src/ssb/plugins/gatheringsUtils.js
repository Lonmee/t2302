const Ref = require('ssb-ref');
const pull = require('pull-stream');
const {
  where,
  live,
  and,
  about,
  isPublic,
  toPullStream,
  toCallback,
} = require('ssb-db2/operators');

module.exports = {
  name: 'gatheringsUtils',
  version: '1.0.0',
  manifest: {
    gatheringAttendees: 'source',
    gatheringInfo: 'async',
  },
  permissions: {
    master: {
      allow: ['gatheringInfo', 'gatheringAttendees'],
    },
  },
  init: function init(ssb) {
    return {
      /**
       * Will fetch all the attending user list
       *
       * @param msgId Gathering event we want the attendees info of
       */
      gatheringAttendees(msgId) {
        let gatheringAttendees = [];

        return pull(
          ssb.db.query(
            where(and(about(msgId), isPublic())),
            live({old: true}),
            toPullStream(),
          ),
          pull.filter(
            about =>
              isAttendeeMsg(about) &&
              Ref.isFeedId(about.value.content.attendee.link),
          ),
          pull.map(about => {
            const {attendee} = about.value.content;

            gatheringAttendees = attendee
              ? attendee.remove
                ? gatheringAttendees.filter(feedId => feedId !== attendee.link)
                : [...gatheringAttendees, attendee.link]
              : gatheringAttendees;

            return gatheringAttendees;
          }),
        );
      },

      /**
       * Will fetch all the About that are linked to a particular gathering
       * event and merge them together to get the current info of the gathering
       *
       * @param msgId Gathering event the abouts should refer too
       */
      gatheringInfo(msgId, cb) {
        return pull(
          ssb.db.query(
            where(and(about(msgId), isPublic())),
            toCallback((err, abouts) => {
              if (err) {
                cb(err);
                return;
              }
              const reducedGatheringInfo = abouts
                .filter(about => !isAttendeeMsg(about))
                .reduce(
                  (gatheringInfo, about) => {
                    return {
                      ...gatheringInfo,
                      ...about.value.content,
                    };
                  },
                  {about: msgId},
                );
              cb(null, reducedGatheringInfo);
            }),
          ),
        );
      },
    };
  },
};

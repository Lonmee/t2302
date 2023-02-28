/**
 * Created on 27 Aug 2022 by lonmee
 *
 */
import log from '../../../utils/Log';

export default {
  name: 'starter',
  init: ssb => {
    return {
      start() {
        ssb.conn.start((e, v) =>
          e
            ? console.error(e)
            : (ssb.replicationScheduler.start((e, v) =>
                e
                  ? console.error(e)
                  : log('ssb client', 'replicationScheduler.start', v),
              ),
              log('ssb client', 'conn.start', v)),
        );
        ssb.suggest.start((e, v) =>
          e ? console.error(e) : log('ssb client', 'suggest.start', v),
        );
        ssb.friendsPurge.start((e, v) =>
          e ? console.error(e) : log('ssb client', 'friendsPurge.start', v),
        );
        // ssb.conn.stage((e, v) =>
        //   e ? console.error(e) : log('ssb client', 'conn.stage'),
        // );
      },
    };
  },
};

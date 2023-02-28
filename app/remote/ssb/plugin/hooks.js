import xs from 'xstream';

export default {
  name: 'hooks',
  init: () => {
    const stream = xs.create();
    return {
      publish: msg => {
        stream.shamefullySendNext(msg);
      },
      publishStream: () => stream,
    };
  },
};

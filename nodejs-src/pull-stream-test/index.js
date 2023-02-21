/**
 * Created on 29 Aug 2022 by lonmee
 *
 */
const {pull} = require('pull-stream');
const fs = require('fs');

const stream = pull.count(5);

pull(
  stream,
  pull.map(console.log),
  pull.onEnd(() => console.log('complete')),
);

// reduce
// pull(
//   pull.values([1, 3, 5]),
//   pull.reduce(
//     (acc, data) => {
//       console.log(acc, data);
//       return acc + data;
//     },
//     0,
//     (e, v) => console.log(e || v),
//   ),
// );

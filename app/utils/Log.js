/**
 * Created on 27 Aug 2022 by lonmee
 *
 */
import infoLog from 'react-native/Libraries/Utilities/infoLog';

export default (from, ...log) => {
  infoLog(
    `[${from}]%c:%c ${log}`,
    `background-color:${colors[from]};`,
    'background-color:#fff0;',
  );
};

const colors = {
  'ssb server': '#0068ff',
  'ssb client': '#359f03',
  'node log': '#947a00',
  'app log': '#670070',
};

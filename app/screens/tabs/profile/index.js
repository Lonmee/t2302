import {SafeAreaView, SectionList} from 'react-native';
import {useStyle} from '../../shared';
import {version, build} from '../../../app.json';
import Item from './item';
import Header from './header';

/**
 * Created on 22 Nov 2022 by lonmee
 *
 */

export default () => {
  const {flex1, row} = useStyle();
  const data = [
    {
      title: 'Account Information',
      data: [
        {label: 'Nick', data: 'Lonmee'},
        {
          label: 'Description',
          data: 'Nothing',
        },
      ],
    },
    {
      title: 'Build Information',
      data: [
        {label: 'Version', data: version},
        {label: 'Build', data: build},
        {
          label: 'Engine',
          data:
            'Hermes ' +
              global.HermesInternal?.getRuntimeProperties?.()[
                'OSS Release Version'
              ] ?? '',
        },
      ],
    },
  ];
  return (
    <SafeAreaView style={[flex1, row]}>
      <SectionList
        sections={data}
        renderSectionHeader={({section}) => <Header title={section.title} />}
        renderItem={Item}
      />
    </SafeAreaView>
  );
};

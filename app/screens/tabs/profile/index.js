import {Button, SafeAreaView, SectionList, Text} from 'react-native';
import {useStyle} from '../../shared';
import {version, build} from '../../../app.json';
import Item from './item';
import Header from './header';
import {callSSB} from '../../../remote/ssb';
import {IDENTITY_CREATE, IDENTITY_USE} from '../../../remote/ssb/request';

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
      <Text>SSB operations</Text>
      <Button
        title={'create'}
        onPress={() => callSSB(IDENTITY_CREATE).then(ssb => (window.ssb = ssb))}
      />
      <Button
        title={'use'}
        onPress={() => callSSB(IDENTITY_USE).then(ssb => (window.ssb = ssb))}
      />
    </SafeAreaView>
  );
};

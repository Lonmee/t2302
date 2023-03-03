import {Button, SafeAreaView, SectionList, Text} from 'react-native';
import {useStyle} from '../../shared';
import {build, version} from '../../../app.json';
import Item from './item';
import Header from './header';
import {callSSB} from '../../../remote/ssb';
import {IDENTITY_CREATE, IDENTITY_USE} from '../../../remote/ssb/request';
import pull from 'pull-stream';
import {useCallback, useEffect} from 'react';
import {useSelector} from 'react-redux';

/**
 * Created on 22 Nov 2022 by lonmee
 *
 */

export default () => {
  const {flex1, row} = useStyle();
  const id = useSelector(state => state.user.id);

  useEffect(() => {
    console.log('once', id);
    id && startSSB();
  }, []);

  const startSSB = useCallback(req => {
    callSSB(req || IDENTITY_USE).then(
      ssb => (
        ssb.starter.start(),
        (window.ssb = ssb),
        pull(ssb.conn.stagedPeers(), pull.drain(console.log))
      ),
    );
  }, []);

  const data = [
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
    {
      title: 'Account Information',
      data: [
        {label: 'Id', data: 'xxx'},
        {label: 'Nick', data: 'Lonmee'},
        {
          label: 'Description',
          data: 'Nothing',
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
      <Button
        title={'create account'}
        onPress={() => startSSB(IDENTITY_CREATE)}
      />
    </SafeAreaView>
  );
};

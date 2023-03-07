import {Button, FlatList, SafeAreaView, SectionList, Text} from 'react-native';
import {useStyle} from '../../shared';
import {build, version} from '../../../app.json';
import Item from './item';
import Header from './header';
import {
  callSSB,
  request as ssbRequest,
  response as ssbResponse,
} from '../../../remote/ssb';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchSsbId, resetId} from '../../../store/features/userSlice';
import pull from 'pull-stream';

/**
 * Created on 22 Nov 2022 by lonmee
 *
 */

export default () => {
  const {flex1, row} = useStyle();
  const dispatch = useDispatch();
  const id = useSelector(state => state.user.id);

  const [stagedPeers, setStagedPeers] = useState([]);
  const [peers, setPeers] = useState([]);
  const [storageUsed, setStorageUsed] = useState({});

  useEffect(() => {
    id &&
      callSSB(ssbRequest.IDENTITY_USE)
        .then(({msg, ssb}) => {
          msg === ssbResponse.IDENTITY_READY &&
            (ssb.starter.start(),
            (window.ssb = ssb),
            pull(ssb.conn.stagedPeers(), pull.drain(setStagedPeers)),
            pull(ssb.conn.peers(), pull.drain(setPeers)));
        })
        .catch(console.warn);
  }, []);

  const connectionItem = ({index, item, section, separators}) => {
    const {label, data} = item;
    return (
      <>
        <Text>{label + ': ' + data.length}</Text>
        <Text>**********************</Text>
        <FlatList
          data={data}
          renderItem={({item: [addr, props]}) => (
            <Text>
              <Text style={[{color: 'blue'}]}>addr: </Text>
              <Text>{addr + '\n'}</Text>
              <Text style={[{color: 'green'}]}>type: </Text>
              <Text>{props.type + '\n'}</Text>
              <Text style={[{color: 'orange'}]}>verified: </Text>
              <Text>{props.verified + '\n'}</Text>
              <Text>~~~~~~~~~~~~~~~~~~~~~~</Text>
            </Text>
          )}
        />
      </>
    );
  };

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
        {label: 'Id', data: id},
        {label: 'Nick', data: ''},
        {
          label: 'Description',
          data: '',
        },
      ],
    },
    {
      title: 'connection Information',
      data: [
        {label: 'staged', data: stagedPeers},
        {label: 'peers', data: peers},
      ],
      renderItem: connectionItem,
    },
  ];
  return (
    <SafeAreaView style={[flex1, row]}>
      <SectionList
        sections={data}
        renderSectionHeader={({section}) => <Header title={section.title} />}
        renderItem={Item}
        ListFooterComponent={() =>
          !id ? (
            <Button
              title={'create account'}
              onPress={() =>
                dispatch(fetchSsbId())
                  .unwrap()
                  .then(ssb => {
                    ssb && (ssb.starter.start(), (window.ssb = ssb));
                  })
                  .catch(console.warn)
              }
            />
          ) : (
            <Button
              title={'delete account'}
              onPress={() =>
                callSSB(ssbRequest.IDENTITY_CLEAR)
                  .then(({msg}) => {
                    msg === ssbResponse.IDENTITY_CLEARED &&
                      ((window.ssb = undefined), dispatch(resetId()));
                  })
                  .catch(console.warn)
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export * from 'events';

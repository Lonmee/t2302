import {Button, SafeAreaView, SectionList} from 'react-native';
import {useStyle} from '../../shared';
import {build, version} from '../../../app.json';
import Item from './item';
import Header from './header';
import {
  callSSB,
  request as ssbRequest,
  response as ssbResponse,
} from '../../../remote/ssb';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchSsbId, resetId} from '../../../store/features/userSlice';

/**
 * Created on 22 Nov 2022 by lonmee
 *
 */

export default () => {
  const {flex1, row} = useStyle();
  const dispatch = useDispatch();
  const id = useSelector(state => state.user.id);

  useEffect(() => {
    id &&
      callSSB(ssbRequest.IDENTITY_USE)
        .then(({msg, ssb}) => {
          msg === ssbResponse.IDENTITY_READY &&
            (ssb.starter.start(), (window.ssb = ssb));
        })
        .catch(console.warn);
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
        {label: 'Id', data: id},
        {label: 'Nick', data: ''},
        {
          label: 'Description',
          data: '',
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
      {!id ? (
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
      )}
      <Button title={'refresh'} onPress={() => {}} />
    </SafeAreaView>
  );
};

export * from 'events';

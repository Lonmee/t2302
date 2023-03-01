/**
 * Created on 15 Dec 2022 by lonmee
 *
 */
import {useSyncExternalStore} from 'react';
import Appearance from 'react-native/Libraries/Utilities/Appearance';

function useInfo() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () =>
      Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content',
  );
}

function useStagePeers() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () =>
      Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content',
  );
}

function useFeeds() {
  return useSyncExternalStore(
    callback => {
      const appearanceSubscription = Appearance.addChangeListener(callback);
      return () => appearanceSubscription.remove();
    },
    () =>
      Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content',
  );
}

export {useInfo, useFeeds};

/**
 * Created on 15 Dec 2022 by lonmee
 *
 */
import React from 'react';
import {persist} from '../../../store';
import {PersistGate} from 'redux-persist/integration/react';

export default Child => props =>
  (
    <PersistGate loading={null} persistor={persist}>
      <Child {...props} />
    </PersistGate>
  );

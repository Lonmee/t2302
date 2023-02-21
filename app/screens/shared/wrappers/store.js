import {Provider} from 'react-redux';
import React from 'react';
import {store} from '../../../store';

/**
 * Created on 15 Dec 2022 by lonmee
 *
 */
export default Child => props =>
  (
    <Provider store={store}>
      <Child {...props} />
    </Provider>
  );

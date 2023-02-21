/**
 * Created on 25 Jun 2022 by lonmee
 *
 */

import {createSlice} from '@reduxjs/toolkit';

export const runtimeSlice = createSlice({
  name: 'runtime',
  initialState: {
    // eslint-disable-next-line no-undef
    startedAt: __BUNDLE_START_TIME__,
  },
  reducers: {},
});

export const {} = runtimeSlice.actions;

export default runtimeSlice.reducer;

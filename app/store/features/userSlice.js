/**
 * Created on 25 Jun 2022 by lonmee
 *
 */

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {callSSB} from '../../remote/ssb';

export const fetchSsbId = createAsyncThunk(
  'user/fetchSsbId',
  async (mnemonic, thunkAPI) => {
    const response = await callSSB(
      mnemonic === undefined ? 'CREATE' : 'RESTORE: ' + mnemonic,
    );
    return response.id;
  },
  {dispatchConditionRejection: true},
);

/**
 * INITIALIZED: nothing but initialized
 * CREATED: ssdID created but wallet account in-process
 * IMPORTED: ssbID restore but wallet account in-process
 * USED: ssbID and wallet account both exist
 * @type {{CREATED: string, INITIALIZED: string, USED: string, IMPORTED: string}}
 */
export const UserPhase = {
  INITIALIZED: 'initialized',
  CREATED: 'created',
  IMPORTED: 'imported',
  RESYNC: 'resync',
  USED: 'used',
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '',
    phase: UserPhase.INITIALIZED,
    loading: 'idle',
  },
  reducers: {
    setPhase: (state, action) => {
      state.phase = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSsbId.pending, (state, action) => {
        state.loading = 'pending';
      })
      .addCase(fetchSsbId.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.id = action.payload;
      });
  },
});

export const {setPhase} = userSlice.actions;

export default userSlice.reducer;

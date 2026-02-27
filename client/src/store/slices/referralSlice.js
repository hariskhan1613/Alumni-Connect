import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchReferrals = createAsyncThunk('referrals/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/referrals');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch referrals');
    }
});

export const fetchMatches = createAsyncThunk('referrals/fetchMatches', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/referrals/matches');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
});

export const applyToReferral = createAsyncThunk('referrals/apply', async (id, { rejectWithValue }) => {
    try {
        const { data } = await API.post(`/referrals/${id}/apply`);
        return { id, ...data };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to apply');
    }
});

export const createReferral = createAsyncThunk('referrals/create', async (referralData, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/referrals', referralData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create referral');
    }
});

const referralSlice = createSlice({
    name: 'referrals',
    initialState: {
        referrals: [],
        matches: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearReferralError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReferrals.pending, (state) => { state.isLoading = true; })
            .addCase(fetchReferrals.fulfilled, (state, action) => { state.isLoading = false; state.referrals = action.payload; })
            .addCase(fetchReferrals.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(fetchMatches.pending, (state) => { state.isLoading = true; })
            .addCase(fetchMatches.fulfilled, (state, action) => { state.isLoading = false; state.matches = action.payload; })
            .addCase(fetchMatches.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(applyToReferral.fulfilled, (state, action) => {
                const idx = state.matches.findIndex(m => m._id === action.payload.id);
                if (idx !== -1) { state.matches[idx].hasApplied = true; state.matches[idx].applicationStatus = 'applied'; }
            })
            .addCase(createReferral.fulfilled, (state, action) => { state.referrals.unshift(action.payload); });
    },
});

export const { clearReferralError } = referralSlice.actions;
export default referralSlice.reducer;

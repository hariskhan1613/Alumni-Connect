import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchLeaderboard = createAsyncThunk('gamification/leaderboard', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/gamification/leaderboard');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
});

export const fetchBadges = createAsyncThunk('gamification/badges', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/gamification/badges');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch badges');
    }
});

export const fetchProgress = createAsyncThunk('gamification/progress', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/gamification/progress');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
});

export const checkBadges = createAsyncThunk('gamification/checkBadges', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/gamification/check-badges');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to check badges');
    }
});

export const fetchDashboard = createAsyncThunk('gamification/dashboard', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/gamification/dashboard');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
});

const gamificationSlice = createSlice({
    name: 'gamification',
    initialState: {
        leaderboard: [],
        badges: null,
        progress: null,
        dashboard: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearGamificationError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => { state.isLoading = true; })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => { state.isLoading = false; state.leaderboard = action.payload; })
            .addCase(fetchLeaderboard.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(fetchBadges.fulfilled, (state, action) => { state.badges = action.payload; })
            .addCase(fetchProgress.fulfilled, (state, action) => { state.progress = action.payload; })
            .addCase(checkBadges.fulfilled, (state, action) => {
                if (state.badges && action.payload.newBadges.length > 0) {
                    state.badges.earned = [...state.badges.earned, ...action.payload.newBadges.map(b => ({ ...b, earned: true }))];
                    state.badges.earnedCount = state.badges.earned.length;
                }
            })
            .addCase(fetchDashboard.pending, (state) => { state.isLoading = true; })
            .addCase(fetchDashboard.fulfilled, (state, action) => { state.isLoading = false; state.dashboard = action.payload; })
            .addCase(fetchDashboard.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
    },
});

export const { clearGamificationError } = gamificationSlice.actions;
export default gamificationSlice.reducer;

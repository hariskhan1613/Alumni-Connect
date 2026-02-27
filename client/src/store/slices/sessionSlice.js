import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchSessions = createAsyncThunk('sessions/fetchAll', async (domain, { rejectWithValue }) => {
    try {
        const url = domain ? `/sessions?domain=${domain}` : '/sessions';
        const { data } = await API.get(url);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
});

export const fetchRecommended = createAsyncThunk('sessions/recommended', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/sessions/recommended');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommended');
    }
});

export const bookSession = createAsyncThunk('sessions/book', async (id, { rejectWithValue }) => {
    try {
        const { data } = await API.post(`/sessions/${id}/book`);
        return { id, ...data };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to book session');
    }
});

export const fetchBookings = createAsyncThunk('sessions/bookings', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/sessions/my-bookings');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
});

export const rateSession = createAsyncThunk('sessions/rate', async ({ id, rating, feedback }, { rejectWithValue }) => {
    try {
        const { data } = await API.post(`/sessions/${id}/rate`, { rating, feedback });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to rate session');
    }
});

export const createSession = createAsyncThunk('sessions/create', async (sessionData, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/sessions', sessionData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
});

const sessionSlice = createSlice({
    name: 'sessions',
    initialState: {
        sessions: [],
        recommended: [],
        bookings: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearSessionError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSessions.pending, (state) => { state.isLoading = true; })
            .addCase(fetchSessions.fulfilled, (state, action) => { state.isLoading = false; state.sessions = action.payload; })
            .addCase(fetchSessions.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(fetchRecommended.fulfilled, (state, action) => { state.recommended = action.payload; })
            .addCase(bookSession.fulfilled, (state, action) => {
                const idx = state.recommended.findIndex(s => s._id === action.payload.id);
                if (idx !== -1) state.recommended[idx].isBooked = true;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => { state.bookings = action.payload; })
            .addCase(createSession.fulfilled, (state, action) => { state.sessions.unshift(action.payload); });
    },
});

export const { clearSessionError } = sessionSlice.actions;
export default sessionSlice.reducer;

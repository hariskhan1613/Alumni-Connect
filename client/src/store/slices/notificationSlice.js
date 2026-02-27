import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/notifications');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message);
    }
});

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/notifications/unread-count');
        return data.count;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message);
    }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
    try {
        await API.put(`/notifications/${id}/read`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message);
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        isLoading: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const item = state.items.find((n) => n._id === action.payload);
                if (item) item.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

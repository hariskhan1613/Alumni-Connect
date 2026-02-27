import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/messages/conversations');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (userId, { rejectWithValue }) => {
    try {
        const { data } = await API.get(`/messages/${userId}`);
        return { userId, messages: data };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ receiverId, message }, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/messages/send', { receiverId, message });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        conversations: [],
        activeChat: null,
        messages: [],
        onlineUsers: [],
        typingUsers: [],
        isLoading: false,
    },
    reducers: {
        setActiveChat: (state, action) => { state.activeChat = action.payload; },
        addMessage: (state, action) => { state.messages.push(action.payload); },
        setOnlineUsers: (state, action) => { state.onlineUsers = action.payload; },
        addTypingUser: (state, action) => {
            if (!state.typingUsers.includes(action.payload)) state.typingUsers.push(action.payload);
        },
        removeTypingUser: (state, action) => {
            state.typingUsers = state.typingUsers.filter((id) => id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload; })
            .addCase(fetchMessages.pending, (state) => { state.isLoading = true; })
            .addCase(fetchMessages.fulfilled, (state, action) => { state.isLoading = false; state.messages = action.payload.messages; })
            .addCase(sendMessage.fulfilled, (state, action) => { state.messages.push(action.payload); });
    },
});

export const { setActiveChat, addMessage, setOnlineUsers, addTypingUser, removeTypingUser } = chatSlice.actions;
export default chatSlice.reducer;

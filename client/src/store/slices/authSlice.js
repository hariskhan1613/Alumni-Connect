import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/auth/login', credentials);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/auth/register', userData);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/auth/me');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (updates, { rejectWithValue }) => {
    try {
        const { data } = await API.put('/users/profile', updates);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
});

const user = JSON.parse(localStorage.getItem('user'));

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: user || null,
        profile: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('user');
            state.user = null;
            state.profile = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
            .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
            .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.profile = action.payload;
                // Sync role, profilePic, name back into state.user and localStorage
                if (state.user && action.payload) {
                    state.user.role = action.payload.role;
                    state.user.profilePic = action.payload.profilePic;
                    state.user.name = action.payload.name;
                    const stored = JSON.parse(localStorage.getItem('user'));
                    if (stored) {
                        stored.role = action.payload.role;
                        stored.profilePic = action.payload.profilePic;
                        stored.name = action.payload.name;
                        localStorage.setItem('user', JSON.stringify(stored));
                    }
                }
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => { state.profile = action.payload; });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

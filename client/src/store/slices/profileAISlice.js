import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const getAIProfile = createAsyncThunk('profileAI/getProfile', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/profile-ai/profile');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to load AI profile');
    }
});

export const uploadCV = createAsyncThunk('profileAI/uploadCV', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/profile-ai/upload-cv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload CV');
    }
});

export const getProfileScore = createAsyncThunk('profileAI/getScore', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/profile-ai/profile-score');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to get score');
    }
});

export const getRoleReadiness = createAsyncThunk('profileAI/roleReadiness', async (targetRole, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/profile-ai/role-readiness', { targetRole });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to get readiness');
    }
});

export const generateResume = createAsyncThunk('profileAI/generateResume', async (targetRole, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/profile-ai/generate-resume', { targetRole });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to generate resume');
    }
});

export const getATSScore = createAsyncThunk('profileAI/atsScore', async (targetRole, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/profile-ai/ats-score', { targetRole });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to get ATS score');
    }
});

export const updateAIProfile = createAsyncThunk('profileAI/updateProfile', async (updates, { rejectWithValue }) => {
    try {
        const { data } = await API.put('/profile-ai/update-profile', updates);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
});

export const getTargetRoles = createAsyncThunk('profileAI/getRoles', async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get('/profile-ai/roles');
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to get roles');
    }
});

const profileAISlice = createSlice({
    name: 'profileAI',
    initialState: {
        profile: null,
        roles: [],
        roleReadiness: null,
        resume: null,
        atsScore: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearProfileError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAIProfile.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(getAIProfile.fulfilled, (state, action) => { state.isLoading = false; state.profile = action.payload; })
            .addCase(getAIProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(uploadCV.pending, (state) => { state.isLoading = true; })
            .addCase(uploadCV.fulfilled, (state, action) => { state.isLoading = false; state.profile = { ...state.profile, ...action.payload.profile }; })
            .addCase(uploadCV.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(getRoleReadiness.fulfilled, (state, action) => { state.roleReadiness = action.payload; })
            .addCase(generateResume.pending, (state) => { state.isLoading = true; })
            .addCase(generateResume.fulfilled, (state, action) => { state.isLoading = false; state.resume = action.payload; })
            .addCase(generateResume.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(getATSScore.fulfilled, (state, action) => { state.atsScore = action.payload; })
            .addCase(updateAIProfile.fulfilled, (state, action) => { state.profile = { ...state.profile, ...action.payload.user }; })
            .addCase(getTargetRoles.fulfilled, (state, action) => { state.roles = action.payload.roles; });
    },
});

export const { clearProfileError } = profileAISlice.actions;
export default profileAISlice.reducer;

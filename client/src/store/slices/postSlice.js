import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (page = 1, { rejectWithValue }) => {
    try {
        const { data } = await API.get(`/posts?page=${page}`);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
});

export const createPost = createAsyncThunk('posts/createPost', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await API.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
});

export const likePost = createAsyncThunk('posts/likePost', async (postId, { rejectWithValue }) => {
    try {
        const { data } = await API.put(`/posts/${postId}/like`);
        return { postId, likes: data.likes };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
});

export const commentOnPost = createAsyncThunk('posts/commentOnPost', async ({ postId, text }, { rejectWithValue }) => {
    try {
        const { data } = await API.post(`/posts/${postId}/comment`, { text });
        return { postId, comments: data };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to comment');
    }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (postId, { rejectWithValue }) => {
    try {
        await API.delete(`/posts/${postId}`);
        return postId;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
});

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        total: 0,
        pages: 0,
        page: 1,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.posts = action.payload.posts;
                state.total = action.payload.total;
                state.pages = action.payload.pages;
                state.page = action.payload.page;
            })
            .addCase(fetchPosts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(createPost.fulfilled, (state, action) => { state.posts.unshift(action.payload); })
            .addCase(likePost.fulfilled, (state, action) => {
                const post = state.posts.find((p) => p._id === action.payload.postId);
                if (post) post.likes = action.payload.likes;
            })
            .addCase(commentOnPost.fulfilled, (state, action) => {
                const post = state.posts.find((p) => p._id === action.payload.postId);
                if (post) post.comments = action.payload.comments;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter((p) => p._id !== action.payload);
            });
    },
});

export default postSlice.reducer;

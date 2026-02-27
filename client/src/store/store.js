import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import profileAIReducer from './slices/profileAISlice';
import referralReducer from './slices/referralSlice';
import sessionReducer from './slices/sessionSlice';
import gamificationReducer from './slices/gamificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        chat: chatReducer,
        notifications: notificationReducer,
        profileAI: profileAIReducer,
        referrals: referralReducer,
        sessions: sessionReducer,
        gamification: gamificationReducer,
    },
});

export default store;

// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.mjs';

const store = configureStore({
    reducer: {
        auth: authReducer ///
    }
});

export default store;

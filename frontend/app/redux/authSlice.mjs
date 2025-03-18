import { createSlice } from "@reduxjs/toolkit";

/**
 * @typedef {Object} AuthState
 * @property {string|null} token
 */

/** @type {AuthState} */
const initialState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth", // Thêm name vào đây
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

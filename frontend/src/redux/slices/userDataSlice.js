import { createSlice } from "@reduxjs/toolkit";

const userData = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};

const initialState = {
  user: userData,
};

export const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    storeUserData: (state, action) => {
      state.user = action.payload;
    },
    clearUserData: (state, action) => {
      state.user = {};
    },
  },
});

export const { storeUserData, clearUserData } = userDataSlice.actions;
export default userDataSlice.reducer;

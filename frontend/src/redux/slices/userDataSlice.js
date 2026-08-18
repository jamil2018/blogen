import { createSlice } from "@reduxjs/toolkit";

export const USER_STORAGE_KEY = "user";

const initialState = {
  user: {},
  isRehydrated: false,
};

export const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    hydrateUserData: (state, action) => {
      state.user = action.payload ?? {};
      state.isRehydrated = true;
    },
    storeUserData: (state, action) => {
      state.user = action.payload ?? {};
      state.isRehydrated = true;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(state.user)
        );
      }
    },
    clearUserData: (state) => {
      state.user = {};
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    },
  },
});

export const { hydrateUserData, storeUserData, clearUserData } =
  userDataSlice.actions;
export default userDataSlice.reducer;

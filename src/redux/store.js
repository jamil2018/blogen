import { configureStore } from "@reduxjs/toolkit";
import userDataReducer from "./slices/userDataSlice";
import searchDataReducer from "./slices/searchDataSlice";

export const store = configureStore({
  reducer: {
    userData: userDataReducer,
    searchData: searchDataReducer,
  },
  devTools: true,
});

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchQuery: "",
};

export const searchDataSlice = createSlice({
  name: "searchData",
  initialState,
  reducers: {
    storeSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { storeSearchQuery } = searchDataSlice.actions;
export default searchDataSlice.reducer;

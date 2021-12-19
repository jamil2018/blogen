import axios from "axios";
import { store } from "../redux/store";

export const getAllCategories = async () => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get("/api/categories", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};
export const getCategoryById = async (catId) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get(`/api/categories/${catId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post("/api/categories", categoryData, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

export const updateCategoryById = async (updatedCategoryData) => {
  try {
    const { categoryId, values } = updatedCategoryData;
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.put(
      `/api/categories/${categoryId}`,
      values,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

export const deleteMultipleCategoriesById = async (categoryId) => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      data: { id: categoryId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.delete("/api/categories", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getCuratedCategoryList = async () => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get("/api/categories/curated", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

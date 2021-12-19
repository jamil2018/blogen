import axios from "axios";
import { store } from "../redux/store";

export const signInUser = async ({ email, password }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      "/api/users/login",
      { email, password },
      config
    );
    return data;
  } catch (err) {
    const error = new Error(
      `Error while fetching data. Error Message: ${err.message}`
    );
    error.status = err.response.request.status;
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/users/", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

export const createUser = async (userData) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post("/api/users", userData, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

export const getUserById = async (userId) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(`/api/users/${userId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};
// update currently logged in user data
export const updateUser = async (updatedUserData) => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.put(
      `/api/users/profile`,
      updatedUserData,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

// update a user by id. for admin users.
export const updateUserById = async (updatedUserData) => {
  try {
    const { userId, values } = updatedUserData;
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.put(
      `/api/users/profile/${userId}`,
      values,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

export const deleteMultipleUsersById = async (userId) => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      data: { id: userId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.delete("/api/users", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getCuratedUserList = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/users/curated", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

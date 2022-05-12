import axios from "axios";
import { store } from "../redux/store";
import fileStorage from "../utils/fileStorage";

if (process.env.REACT_APP_NODE_ENV === "PRODUCTION") {
  axios.defaults.baseURL = process.env.REACT_APP_PRODUCTION_API;
}

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
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getLatestUsers = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/users/latest", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};
export const createUser = async (userData) => {
  try {
    const formData = new FormData();
    const [imageFileName, imageURL] = await fileStorage(userData.image);
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("imageURL", imageURL);
    formData.append("imageFileName", imageFileName);
    formData.append("bio", userData.bio);
    formData.append("facebookId", userData.facebookId);
    formData.append("linkedinId", userData.linkedinId);
    formData.append("twitterId", userData.twitterId);
    formData.append("isAdmin", userData.isAdmin);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.post("/api/users", formData, config);
    return data;
  } catch (err) {
    const error = new Error(
      `Error while fetching data. Error Message: ${err.message}`
    );
    error.status = err.response.request.status;
    throw error;
  }
};

export const getUserById = async (userId) => {
  if (!userId) return {};
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(`/api/users/${userId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};
// update currently logged in user data
export const updateUser = async (updatedUserData) => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    const formData = new FormData();
    const [imageFileName, imageURL] = await fileStorage(updatedUserData.image);
    formData.append("name", updatedUserData.name);
    formData.append("email", updatedUserData.email);
    formData.append("password", updatedUserData.password);
    formData.append("imageURL", imageURL);
    formData.append("imageFileName", imageFileName);
    formData.append("bio", updatedUserData.bio);
    formData.append("facebookId", updatedUserData.facebookId);
    formData.append("linkedinId", updatedUserData.linkedinId);
    formData.append("twitterId", updatedUserData.twitterId);
    formData.append("isAdmin", updatedUserData.isAdmin);
    const { data } = await axios.put(`/api/users/profile`, formData, config);
    return data;
  } catch (err) {
    const error = new Error(
      `Error while fetching data. Error Message: ${err.message}`
    );
    error.status = err.response.request.status;
    throw error;
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
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    const formData = new FormData();
    const [imageFileName, imageURL] = await fileStorage(values.image);
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("imageURL", imageURL);
    formData.append("imageFileName", imageFileName);
    formData.append("bio", values.bio);
    formData.append("facebookId", values.facebookId);
    formData.append("linkedinId", values.linkedinId);
    formData.append("twitterId", values.twitterId);
    formData.append("isAdmin", values.isAdmin);
    const { data } = await axios.put(
      `/api/users/profile/${userId}`,
      formData,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
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
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

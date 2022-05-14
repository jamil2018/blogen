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
    const imageData = {
      imageURL: "",
      imageFileName: "",
    };
    if (userData.image) {
      const [imageFileName, imageURL] = await fileStorage(userData.image);
      imageData.imageURL = imageURL;
      imageData.imageFileName = imageFileName;
    }
    const userDataToSend = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      bio: userData.bio,
      facebookId: userData.facebookId,
      linkedinId: userData.linkedinId,
      twitterId: userData.twitterId,
      isAdmin: userData.isAdmin,
      imageURL: imageData.imageURL,
      imageFileName: imageData.imageFileName,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post("/api/users", userDataToSend, config);
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const imageData = {
      imageURL: "",
      imageFileName: "",
    };
    if (updatedUserData.image) {
      const [imageFileName, imageURL] = await fileStorage(
        updatedUserData.image
      );
      imageData.imageURL = imageURL;
      imageData.imageFileName = imageFileName;
    }
    const updatedUserDataToSend = {
      name: updatedUserData.name,
      email: updatedUserData.email,
      password: updatedUserData.password,
      bio: updatedUserData.bio,
      facebookId: updatedUserData.facebookId,
      linkedinId: updatedUserData.linkedinId,
      twitterId: updatedUserData.twitterId,
      isAdmin: updatedUserData.isAdmin,
      imageURL: imageData.imageURL,
      imageFileName: imageData.imageFileName,
    };
    const { data } = await axios.put(
      `/api/users/profile`,
      updatedUserDataToSend,
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
    const imageData = {
      imageURL: "",
      imageFileName: "",
    };
    if (values.image) {
      const [imageFileName, imageURL] = await fileStorage(values.image);
      imageData.imageURL = imageURL;
      imageData.imageFileName = imageFileName;
    }
    const updatedUserDataToSend = {
      name: values.name,
      email: values.email,
      password: values.password,
      bio: values.bio,
      facebookId: values.facebookId,
      linkedinId: values.linkedinId,
      twitterId: values.twitterId,
      isAdmin: values.isAdmin,
      imageURL: imageData.imageURL,
      imageFileName: imageData.imageFileName,
    };
    const { data } = await axios.put(
      `/api/users/profile/${userId}`,
      updatedUserDataToSend,
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

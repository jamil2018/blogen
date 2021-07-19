import axios from "axios";

export const signInUser = async (email, password) => {
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
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
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

export const updateUser = async (userData) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(`/api/users/profile`, userData, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fecthing data. Error Message: ${err.message}`);
  }
};

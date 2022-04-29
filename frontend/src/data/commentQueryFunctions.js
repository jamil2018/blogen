import axios from "axios";
import { store } from "../redux/store";

if (process.env.REACT_APP_NODE_ENV === "PRODUCTION") {
  axios.defaults.baseURL = process.env.REACT_APP_PRODUCTION_API;
}

export const getCommentsByPostId = async (postId) => {
  try {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const { data } = await axios.get(`/api/posts/${postId}/comments`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getCommentByPostIdCommentId = async ({ postId, commentId }) => {
  try {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const { data } = await axios.get(
      `/api/posts/${postId}/comments/${commentId}`,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const updateCommentByPostIdCommentId = async ({
  postId,
  commentId,
  values,
}) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.put(
      `/api/posts/${postId}/comments/${commentId}`,
      {
        ...values,
      },
      config
    );
    return data;
    // console.log(postId, commentId, values);
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const createCommentByPostId = async ({ postId, values }) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post(
      `/api/posts/${postId}/comments/`,
      {
        ...values,
      },
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const deleteCommentById = async ({ postId, commentId }) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.delete(
      `/api/posts/${postId}/comments/${commentId}`,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

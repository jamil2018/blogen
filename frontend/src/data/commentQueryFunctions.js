import { api } from "../lib/api";
import { store } from "../redux/store";

export const getCommentsByPostId = async (postId) => {
  try {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    const { data } = await api.get(`/api/posts/${postId}/comments`, config);
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
    const { data } = await api.get(
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
    const { data } = await api.put(
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
    const { data } = await api.post(
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
    const { data } = await api.delete(
      `/api/posts/${postId}/comments/${commentId}`,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

import axios from "axios";
import { store } from "../redux/store";

export const getAllPosts = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/posts", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getPaginatedPosts = async ({ page, limit }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `/api/posts/paginated?page=${page}&limit=${limit}`,
      config
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getLatestPosts = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/posts/latest", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getAllPostsByAuthorId = async (authorId) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get(`/api/posts/author/${authorId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getPostById = async (postId) => {
  try {
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get(`/api/posts/${postId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getPostCategoryName = async ({ categoryName }) => {
  try {
    const reqBody = {
      category: categoryName,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: reqBody,
    };
    const { data } = await axios.get(`/api/posts/find`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const createPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("description", postData.description);
    formData.append("summary", postData.summary);
    formData.append("category", postData.category);
    formData.append("tags", postData.tags);
    formData.append("image", postData.image);
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post("/api/posts", formData, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const updatePostById = async (updatedPostData) => {
  try {
    const { postId, values } = updatedPostData;
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.put(`/api/posts/${postId}`, values, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const deleteMultiplePostsById = async (postId) => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      data: { id: postId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.delete("/api/posts", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getCuratedPostList = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get("/api/posts/curated", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getCuratedPostListByAuthor = async () => {
  try {
    const { userData } = store.getState();
    const { token } = userData.user;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.get("/api/posts/curated/author", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

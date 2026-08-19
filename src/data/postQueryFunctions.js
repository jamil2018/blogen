import { api } from "../lib/api";
import { store } from "../redux/store";
import fileStorage from "../utils/fileStorage";

export const getAllPosts = async () => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await api.get("/api/posts", config);
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
    const { data } = await api.get(
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
    const { data } = await api.get("/api/posts/latest", config);
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
    const { data } = await api.get(`/api/posts/author/${authorId}`, config);
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
    const { data } = await api.get(`/api/posts/${postId}`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getPostByCategoryName = async ({ categoryName }) => {
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
    const { data } = await api.get(`/api/posts/find`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const getPostByTagName = async ({ tagName }) => {
  try {
    const reqBody = {
      tag: tagName,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: reqBody,
    };
    const { data } = await api.get(`/api/posts/find`, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const createPost = async (postData) => {
  try {
    const formData = new FormData();
    const [imageFileName, imageURL] = await fileStorage(postData.image);
    formData.append("title", postData.title);
    formData.append("description", postData.description);
    formData.append("summary", postData.summary);
    formData.append("category", postData.category);
    formData.append("tags", postData.tags);
    formData.append("imageURL", imageURL);
    formData.append("imageFileName", imageFileName);
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await api.post("/api/posts", formData, config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const updatePostById = async (updatedPostData) => {
  try {
    const { postId, values: postData } = updatedPostData;
    const { userData } = store.getState();
    const { user } = userData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const formData = new FormData();
    if (postData.image?.name) {
      const [imageFileName, imageURL] = await fileStorage(postData.image);
      formData.append("imageURL", imageURL);
      formData.append("imageFileName", imageFileName);
    }
    formData.append("title", postData.title);
    formData.append("description", postData.description);
    formData.append("summary", postData.summary);
    formData.append("category", postData.category);
    formData.append("tags", postData.tags);
    const { data } = await api.put(`/api/posts/${postId}`, formData, config);
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
    const { data } = await api.delete("/api/posts", config);
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
    const { data } = await api.get("/api/posts/curated", config);
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
    const { data } = await api.get("/api/posts/curated/author", config);
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const searchPosts = async (searchQuery) => {
  try {
    if (searchQuery.length > 1) {
      const { data } = await api.get(
        `/api/posts/search?query=${searchQuery}`
      );
      return data;
    } else {
      return [];
    }
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

export const searchPostResults = async (searchQuery) => {
  try {
    const { data } = await api.get(
      `/api/posts/searchresult?query=${searchQuery}`
    );
    return data;
  } catch (err) {
    throw new Error(`Error while fetching data. Error Message: ${err.message}`);
  }
};

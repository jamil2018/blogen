import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

import Post from "../models/PostModel.js";
import Category from "../models/CategoryModel.js";
import User from "../models/UserModel.js";
import { getStorageController } from "../config/firebaseConfig.js";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

/**
 * @desc get all posts
 * @route GET /api/posts
 * @access public
 */
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .select("title summary author category tags imageURL")
    .populate("author", "name imageURL imageFileName")
    .populate("category", "title");
  return res.status(200).json(posts);
});

/**
 * @desc get paginated posts
 * @route GET /api/posts/paginated
 * @access public
 */
const getPaginatedPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const posts = await Post.paginate(
    {},
    {
      select:
        "title description summary tags category author createdAt imageURL",
      populate: [
        { path: "category", select: "title" },
        { path: "author", select: "name imageURL imageFileName" },
      ],
      page: page,
      limit: limit,
    }
  );
  return res.status(200).json(posts);
});

/**
 * @desc get post by ID
 * @route GET /api/posts/:id
 * @access public
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .select(
      "title description summary author category tags createdAt imageURL imageFileName"
    )
    .populate("author", "name imageURL imageFileName")
    .populate("category", "title");

  if (post) {
    return res.status(200).json(post);
  } else {
    res.status(400);
    throw new Error("Invalid post iD");
  }
});

/**
 * @desc get last 6 posts
 * @route GET /api/posts/latest
 * @access public
 */
const getLatestPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title summary description author category tags createdAt imageURL")
    .populate("author", "name imageURL imageFileName")
    .populate("category", "title");

  return res.status(200).json(posts);
});

/**
 * @desc create a posts
 * @route POST /api/posts
 * @access private
 */
const createNewPost = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    summary,
    category,
    tags,
    imageURL,
    imageFileName,
  } = req.body;
  const author = req.user._id;
  let tagsArr = [];
  if (tags) {
    if (tags.includes(",")) {
      tagsArr = tags.split(",").map((tag) => tag.trim());
    } else {
      tagsArr.push(tags);
    }
  }
  const post = await Post.create({
    title,
    description,
    author,
    summary,
    category,
    tags: tagsArr,
    imageURL,
    imageFileName,
  });
  if (post) {
    return res.status(201).json({
      _id: post._id,
      title: post.title,
      description: post.description,
      image: post.image,
      author: post.author,
      summary: post.summary,
      category: post.category,
      tags: post.tags,
      imageURL: post.imageURL,
      imageFileName: post.imageFileName,
    });
  } else {
    res.status(400);
    throw new Error("Invalid post data");
  }
});

/**
 * @desc update a post
 * @route PUT /api/posts/:id
 * @access private
 */
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (req.body.imageURL || req.body.imageFileName) {
    const storage = getStorageController(
      process.env.FIREBASE_API_KEY,
      process.env.FIREBASE_AUTH_DOMAIN,
      process.env.FIREBASE_STORAGE_BUCKET
    );
    const oldImageStorageRef = ref(storage, post.imageFileName);
    await deleteObject(oldImageStorageRef);
  }
  if (post) {
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.summary = req.body.summary || post.summary;
    post.category = req.body.category || post.category;
    post.tags = req.body.tags || post.tags;
    post.imageURL = req.body.imageURL || post.imageURL;
    post.imageFileName = req.body.imageFileName || post.imageFileName;
    const updatedPost = await post.save();
    res.status(200).json({
      _id: updatedPost._id,
      title: updatedPost.title,
      description: updatedPost.description,
      imageURL: updatedPost.imageURL,
      imageFileName: updatedPost.imageFileName,
      summary: updatedPost.summary,
      category: updatedPost.category,
      tags: [updatedPost.tags],
    });
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc delete a post
 * @route DELETE /api/posts/:id
 * @access private
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    await post.delete();
    res.status(200).json({ message: "Post has been deleted" });
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc delete multiple posts by id
 * @route DELETE /api/posts
 * @access private
 */
const deleteMultiplePostsById = asyncHandler(async (req, res) => {
  const deleteMarkedPostImages = await Post.find({
    _id: { $in: req.body.id },
  }).select("imageFileName");
  const storage = getStorageController(
    process.env.FIREBASE_API_KEY,
    process.env.FIREBASE_AUTH_DOMAIN,
    process.env.FIREBASE_STORAGE_BUCKET
  );
  deleteMarkedPostImages.forEach(async (post) => {
    if (post.imageFileName) {
      try {
        const storageRef = ref(storage, post.imageFileName);
        await deleteObject(storageRef);
      } catch (err) {
        throw new Error("Failed to delete object from firebase.");
      }
    }
  });
  const { deletedCount } = await Post.deleteMany({
    _id: { $in: req.body.id },
  });
  if (deletedCount > 0) {
    return res.status(200).json({ message: "All posts have been deleted" });
  } else {
    return res.status(400).json({ message: "No posts matched the query" });
  }
});

/**
 * @desc get all comments for a post
 * @route GET /api/posts/:id/comments
 * @access public
 */
const getPostComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: "comments",
    populate: {
      path: "author",
      select: "name imageURL imageFileName",
    },
  });
  if (post) {
    return res.status(200).json(post.comments);
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc get post comment by id
 * @route GET /api/posts/:pid/comments/:cid
 * @access public
 */
const getPostCommentById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.pid).populate({
    path: "comments",
    populate: {
      path: "author",
      select: "name",
    },
  });
  if (post) {
    const comment = post.comments.find(
      (comment) => comment._id == req.params.cid
    );
    if (comment) {
      return res.status(200).json(comment);
    } else {
      res.status(400);
      throw new Error("Invalid comment id");
    }
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc create a post comment
 * @route POST /api/posts/:id/comments
 * @access private
 */
const createPostComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    const { text } = req.body;
    const author = req.user._id;
    const comment = await post.comments.create({ text, author });
    await post.comments.push(comment);
    await post.save();
    return res.status(201).json({
      _id: comment._id,
      text: comment.text,
      author: comment.author,
    });
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc update a post comment
 * @route PUT /api/posts/:pid/comments/:cid
 * @access private
 */
const updatePostComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.pid);
  if (post) {
    const postComment = post.comments.id(req.params.cid);
    if (postComment) {
      postComment.text = req.body.text;
      post.markModified("comments");
      await post.save();
      return res.status(200).json({
        _id: postComment._id,
        text: postComment.text,
        author: postComment.author,
      });
    } else {
      res.status(400);
      throw new Error("Invalid comment id");
    }
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc DELETE a comment
 * @route DELETE /api/posts/:pid/comments/:cid
 * @access private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.pid);
  if (post) {
    const postComment = post.comments.id(req.params.cid);
    if (postComment) {
      postComment.remove();
      await post.save();
      return res.status(200).json({ message: "Comment has been deleted" });
    } else {
      res.status(400);
      throw new Error("Invalid comment id");
    }
  } else {
    res.status(400);
    throw new Error("Invalid post id");
  }
});

/**
 * @desc FIND posts by category, title, tags
 * @route GET /api/posts/find
 * @access public
 */
const findPosts = asyncHandler(async (req, res) => {
  const { category, tag, title } = req.query;
  const postQuery = {};
  if (title) {
    postQuery.title = { $regex: title, $options: "i" };
  }
  if (category) {
    const categoryData = await Category.findOne({ title: category });
    postQuery.category = categoryData._id;
  }
  if (tag) {
    postQuery.tags = { $regex: tag, $options: "i" };
  }
  const posts = await Post.find(postQuery)
    .populate("author", "name imageURL imageFileName")
    .populate("category", "title");
  return res.status(200).json(posts);
});

/**
 * @desc search posts
 * @route GET /api/posts/search
 * @access public
 */
const searchPosts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const posts = await Post.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  }).select("title");
  return res.status(200).json(posts);
});

/**
 * @desc search posts
 * @route GET /api/posts/search/result
 * @access public
 */
const searchPostResults = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const posts = await Post.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  }).populate("author", "name imageURL imageFileName");
  return res.status(200).json(posts);
});

/**
 * @desc GET posts by author id
 * @route GET /api/posts/author/:aid
 * @access public
 */
const getPostsByAuthorId = asyncHandler(async (req, res) => {
  const author = User.findById(req.params.aid);
  if (author) {
    const posts = await Post.find({
      author: {
        _id: req.params.aid,
      },
    })
      .populate("author", "name imageURL imageFileName")
      .populate("category", "title");
    return res.status(200).json(posts);
  } else {
    res.status(400);
    throw new Error("Invalid author id");
  }
});

/**
 * @desc GET curated post count
 * @route GET /api/posts/curated
 * @access public
 */
const getCuratedPostsCount = asyncHandler(async (req, res) => {
  const curatedPosts = await Post.find().select(
    "_id title createdAt updatedAt"
  );
  return res.status(200).json(curatedPosts);
});

/**
 * @desc GET curated post count by author id
 * @route GET /api/posts/curated/author
 * @access public
 */
const getCuratedPostsCountByAuthorId = asyncHandler(async (req, res) => {
  const authorId = req.user._id;
  const curatedPosts = await Post.find({ author: authorId }).select(
    "_id title createdAt updatedAt"
  );
  return res.status(200).json(curatedPosts);
});

export {
  getAllPosts,
  getPaginatedPosts,
  getLatestPosts,
  createNewPost,
  getPostById,
  updatePost,
  deletePost,
  getPostComments,
  getPostCommentById,
  createPostComment,
  updatePostComment,
  deleteComment,
  findPosts,
  getPostsByAuthorId,
  deleteMultiplePostsById,
  getCuratedPostsCount,
  getCuratedPostsCountByAuthorId,
  searchPosts,
  searchPostResults,
};

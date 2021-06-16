import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

import Post from "../models/PostModel.js";
import Category from "../models/CategoryModel.js";
import User from "../models/UserModel.js";

/**
 * @desc get all posts
 * @route GET /api/posts
 * @access public
 */
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .select("title summary author category tags image")
    .populate("author", "name")
    .populate("category", "title");
  return res.status(200).json(posts);
});

/**
 * @desc get post by ID
 * @route GET /api/posts/:id
 * @access public
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .select("title description author category tags image comments")
    .populate("author", "name")
    .populate("category", "title");
  if (post) {
    return res.status(200).json(post);
  } else {
    res.status(400);
    throw new Error("Invalid post iD");
  }
});

/**
 * @desc create a posts
 * @route POST /api/posts
 * @access private
 */
const createNewPost = asyncHandler(async (req, res) => {
  const { title, description, summary, category, tags } = req.body;
  const author = req.user._id;
  const image = {
    data: fs.readFileSync(
      path.join(__rootDirname, process.env.FILE_UPLOAD_PATH, req.file.filename)
    ),
    contentType: "image/*",
  };
  const post = await Post.create({
    title,
    description,
    image,
    author,
    summary,
    category,
    tags,
    image,
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
  if (post) {
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.image = req.body.image || post.image;
    post.summary = req.body.summary || post.summary;
    post.category = req.body.category || post.category;
    post.tags = req.body.tags || post.tags;
    const updatedPost = await post.save();
    res.status(200).json({
      _id: updatedPost._id,
      title: updatedPost.title,
      description: updatedPost.description,
      image: updatedPost.image,
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
 * @desc get all comments for a post
 * @route GET /api/posts/:id/comments
 * @access public
 */
const getPostComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    return res.status(200).json(post.comments);
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
    const { text, author } = req.body;
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
  const { category, tags, title } = req.body;
  const postQuery = {};
  if (title) {
    postQuery.title = { $regex: title, $options: "i" };
  }
  if (category) {
    const categoryData = await Category.findOne({ title: category });
    postQuery.category = categoryData._id;
  }
  if (tags) {
    postQuery.tags = { $in: tags };
  }
  const posts = await Post.find(postQuery)
    .populate("author", "name")
    .populate("category", "title");
  return res.status(200).json(posts);
});

/**
 * @desc GET posts by author id
 * @route GET /api/author/:id
 * @access public
 */
const getPostsByAuthorId = asyncHandler(async (req, res) => {
  const author = User.findById(req.params.id);
  if (author) {
    const posts = await Post.find({ author: req.params.id });
    return res.status(200).json(posts);
  } else {
    res.status(400);
    throw new Error("Invalid author id");
  }
});
export {
  getAllPosts,
  createNewPost,
  getPostById,
  updatePost,
  deletePost,
  getPostComments,
  createPostComment,
  updatePostComment,
  deleteComment,
  findPosts,
  getPostsByAuthorId,
};

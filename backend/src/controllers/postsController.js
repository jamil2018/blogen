import asyncHandler from "express-async-handler";

import Post from "../models/PostModel.js";

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
  const { title, description, image, author, summary, category, tags } =
    req.body;
  const post = await Post.create({
    title,
    description,
    image,
    author,
    summary,
    category,
    tags,
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
      tags: [post.tags],
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

export { getAllPosts, createNewPost, getPostById, updatePost, deletePost };

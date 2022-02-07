import asyncHandler from "express-async-handler";

import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";
import fs from "fs";
import path from "path";

/**
 * @desc get all users
 * @route GET /api/users
 * @access public
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  return res.status(200).json(users);
});

/**
 * @desc get user by id
 * @route GET /api/user/:id
 * @access public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  return res.status(200).json(user);
});
/**
 * @desc create new user & generate token
 * @route POST /api/users
 * @access public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, bio, facebookId, linkedinId, twitterId } =
    req.body;
  const image = {
    data: fs.readFileSync(
      path.join(__rootDirname, process.env.FILE_UPLOAD_PATH, req.file.filename)
    ),
    contentType: "image/*",
  };
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    bio,
    facebookId,
    linkedinId,
    twitterId,
    image,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @desc authenticate user and generate token
 * @route POST /api/users/login
 * @access public
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @desc get user profile data
 * @route GET /api/users/profile
 * @access private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let image;
  if (req.file) {
    image = {
      data: fs.readFileSync(
        path.join(
          __rootDirname,
          process.env.FILE_UPLOAD_PATH,
          req.file.filename
        )
      ),
      contentType: "image/*",
    };
  }
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.facebookId = req.body.facebookId || user.facebookId;
    user.linkedinId = req.body.linkedinId || user.linkedinId;
    user.twitterId = req.body.twitterId || user.twitterId;
    user.image = image || user.image;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      facebookId: updatedUser.facebookId,
      linkedinId: updatedUser.linkedinId,
      twitterId: updatedUser.twitterId,
      image: updatedUser.image,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc update user profile by id
 * @route PUT /api/users/profile/:id
 * @access private
 */
const updateUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc DELETE users by id
 * @route DELETE /api/users
 * @access private
 */
const deleteUsersById = asyncHandler(async (req, res) => {
  const { deletedCount } = await User.deleteMany({ _id: { $in: req.body.id } });
  if (deletedCount > 0) {
    return res.status(200).json({ message: "All users have been deleted" });
  } else {
    return res.status(400).json({ message: "No users matched the query" });
  }
});

/**
 * @desc GET curated user count
 * @route GET /api/users/curated
 * @access public
 */
const getCuratedUserCount = asyncHandler(async (req, res) => {
  const users = await User.find().select("_id name email createdAt updatedAt");
  return res.status(200).json(users);
});

export {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserProfileById,
  deleteUsersById,
  getCuratedUserCount,
};

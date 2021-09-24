import asyncHandler from "express-async-handler";

import Category from "../models/CategoryModel.js";

/**
 * @desc get all categories
 * @route GET /api/categories
 * @access private
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.status(200).json(categories);
});

/**
 * @desc create a new category
 * @route POST /api/categories
 * @access private, admin
 */
const createNewCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const categoryExists = await Category.findOne({ title });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }
  const category = await Category.create({ title });
  if (category) {
    res.status(201).json({
      _id: category._id,
      title: category.title,
    });
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

/**
 * @desc update a category
 * @route PUT /api/categories/:id
 * @access private, admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    category.title = req.body.title || category.title;
    const updatedCategory = await category.save();
    res.status(200).json({
      _id: updatedCategory._id,
      title: updatedCategory.title,
    });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

/**
 * @desc delete a category
 * @route DELETE /api/categories/:id
 * @access private, admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await category.delete();
    res.status(200).json({ message: "Category has been deleted" });
  } else {
    res.status(400);
    throw new Error("Invalid category id");
  }
});

/**
 * @desc delete multiple categories
 * @route DELETE /api/categories/
 * @access private, admin
 */
const deleteMultipleCategoryById = asyncHandler(async (req, res) => {
  const { deletedCount } = await Category.deleteMany({
    _id: { $in: req.body.id },
  });
  if (deletedCount > 0) {
    return res
      .status(200)
      .json({ message: "All categories have been deleted" });
  } else {
    return res.status(400).json({ message: "No categories matched the query" });
  }
});

/**
 * @desc get a category by id
 * @route GET /api/categories/:id
 * @access public
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    return res.status(200).json(category);
  } else {
    return res.status(400).json({ message: "Invalid category id" });
  }
});

export {
  createNewCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategoryById,
  getCategoryById,
};

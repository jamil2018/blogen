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
 * @access private
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
 * @access private
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
 * @access private
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
export { createNewCategory, getAllCategories, updateCategory, deleteCategory };

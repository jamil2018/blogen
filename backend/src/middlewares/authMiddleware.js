import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      console.error(err);
      res.status(401);
      throw new Error("Unauthorized, token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Unauthorized, No token found.");
  }
});

const checkAdmin = asyncHandler(async (req, res, next) => {
  if (req.user) {
    const { isAdmin } = req.user;
    if (isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("Unauthorized, invalid admin operation request");
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized, token failed");
  }
});

export { protect, checkAdmin };

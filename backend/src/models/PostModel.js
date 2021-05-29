import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    summary: {
      type: String,
      required: true,
    },
    tags: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);

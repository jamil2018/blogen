"use client";

import { Chip } from "@mui/material";
import Link from "next/link";

const PostTag = ({ text, ...props }) => {
  return (
    <Chip
      component={Link}
      href={`/posts/search/tags/${text}`}
      variant="outlined"
      {...props}
      label={text}
      color="primary"
    />
  );
};

export default PostTag;

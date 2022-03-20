import { Chip } from "@material-ui/core";
import { Link } from "react-router-dom";

const PostTag = ({ text, ...props }) => {
  return (
    <Chip
      component={Link}
      to={`/posts/search/tags/${text}`}
      variant="outlined"
      {...props}
      label={text}
      color="primary"
    />
  );
};

export default PostTag;

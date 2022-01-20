import { Chip } from "@material-ui/core";

const PostTag = ({ text, ...props }) => {
  return <Chip variant="outlined" {...props} label={text} color="primary" />;
};

export default PostTag;

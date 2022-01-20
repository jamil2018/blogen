import { Box, Chip, makeStyles } from "@material-ui/core";
import PostTag from "./PostTag";

const useStyles = makeStyles((theme) => ({
  tagsContainer: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(4),
  },
  chip: {
    marginLeft: theme.spacing(2),
    "&:first-child": {
      marginLeft: 0,
    },
  },
}));

const PostTagDeck = ({ tags }) => {
  const classes = useStyles();
  return (
    <Box className={classes.tagsContainer}>
      {tags.map((tag) => (
        <PostTag text={tag} className={classes.chip} />
      ))}
    </Box>
  );
};

export default PostTagDeck;

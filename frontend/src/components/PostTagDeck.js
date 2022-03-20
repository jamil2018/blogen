import { Box, makeStyles } from "@material-ui/core";
import { orange } from "@material-ui/core/colors";
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
    textDecoration: "none",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: orange[50],
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

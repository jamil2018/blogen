import {
  Box,
  CircularProgress,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { getCommentsByPostId } from "../data/commentQueryFunctions";
import { COMMENT_DATA } from "../definitions/reactQueryConstants/queryConstants";
import PostComment from "./PostComment";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
    maxHeight: "60vh",
    overflowY: "auto",
    paddingRight: theme.spacing(2),
    "&::-webkit-scrollbar": {
      width: "0.4em",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: grey[200],
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const PostCommentDeck = ({ postId, editHandler, deleteHandler }) => {
  // user data
  const { user } = useSelector((state) => state.userData);

  // classes
  const classes = useStyles();

  // query
  const { isLoading, data, isFetching } = useQuery(
    [COMMENT_DATA, postId],
    ({ queryKey }) => getCommentsByPostId(queryKey[1])
  );

  return (
    <>
      {isLoading || isFetching ? (
        <Grid container justify="center" alignItems="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Box className={classes.container}>
          {data.length > 0 ? (
            data.map((comment) => (
              <PostComment
                key={comment._id}
                showCommentActions={
                  user._id === comment.author._id ? true : false
                }
                authorId={comment.author._id}
                authorName={comment.author.name}
                commentText={comment.text}
                editHandler={() => {
                  editHandler(comment._id);
                }}
                deleteHandler={() => {
                  deleteHandler(comment._id);
                }}
              />
            ))
          ) : (
            <Typography variant="subtitle1">No comments yet...</Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default PostCommentDeck;

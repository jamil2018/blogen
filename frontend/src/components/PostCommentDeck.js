import {
  Box,
  CircularProgress,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useQuery } from "react-query";
import { getCommentsByPostId } from "../data/commentQueryFunctions";
import { COMMENT_DATA } from "../definitions/reactQueryConstants/queryConstants";
import PostComment from "./PostComment";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
    maxHeight: "60vh",
    overflowY: "auto",
  },
}));

const PostCommentDeck = ({ postId }) => {
  const classes = useStyles();
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
                authorName={comment.author.name}
                commentText={comment.text}
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

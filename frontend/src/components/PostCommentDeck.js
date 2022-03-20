import { Box, makeStyles, Typography } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { memo } from "react";
import { useSelector } from "react-redux";
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

const PostCommentDeck = memo(({ comments, editHandler, deleteHandler }) => {
  // user data
  const { user } = useSelector((state) => state.userData);

  // classes
  const classes = useStyles();

  return (
    <>
      <Box className={classes.container}>
        {comments.length > 0 ? (
          comments.map((comment) => (
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
    </>
  );
});

export default PostCommentDeck;

import {
  Avatar,
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { getAuthorNameInitials } from "../utils/dataFormat";

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },
  authorText: {
    marginTop: theme.spacing(1),
    color: grey[500],
    fontWeight: theme.typography.fontWeightLight,
  },
  commentTextContainer: {
    alignSelf: "flex-start",
  },
  actionButtonContainer: {
    alignSelf: "flex-start",
  },
  hide: {
    visibility: "hidden",
  },
}));

const PostComment = ({
  authorId,
  authorName,
  commentText,
  editHandler,
  deleteHandler,
  showCommentActions,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.container} elevation={1} variant="outlined">
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={2}>
            <Grid
              direction="column"
              container
              justifyContent="center"
              alignItems="center"
            >
              <Avatar>{getAuthorNameInitials(authorName)}</Avatar>
              <Typography variant="subtitle2" className={classes.authorText}>
                {authorName}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={9} className={classes.commentTextContainer}>
            <Typography variant="subtitle1" color="secondary">
              {commentText}
            </Typography>
          </Grid>
          <Grid item xs={1} className={classes.actionButtonContainer}>
            <Grid
              container
              justifyContent="space-evenly"
              alignItems="flex-start"
              className={showCommentActions ? "" : classes.hide}
            >
              <IconButton
                aria-label="edit"
                size="small"
                edge="start"
                color="primary"
                onClick={editHandler}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                size="small"
                edge="start"
                color="primary"
                onClick={deleteHandler}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PostComment;

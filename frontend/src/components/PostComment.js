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
import { memo } from "react";
import { Link } from "react-router-dom";
import { getAuthorNameInitials } from "../utils/dataFormat";
import { getBase64ImageURL } from "../utils/imageConvertion";

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },
  authorText: {
    marginTop: theme.spacing(1),
    color: grey[500],
    fontWeight: theme.typography.fontWeightLight,
    textDecoration: "none",
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

const PostComment = memo(
  ({
    authorImageURL,
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
                {authorImageURL ? (
                  <Avatar
                    alt="user profile image"
                    className={classes.avatar}
                    src={authorImageURL}
                  />
                ) : (
                  <Avatar alt="user profile image" className={classes.avatar}>
                    {getAuthorNameInitials(authorName)}
                  </Avatar>
                )}
                <Typography
                  component={Link}
                  to={`/authors/${authorId}`}
                  variant="subtitle2"
                  className={classes.authorText}
                >
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
  }
);

export default PostComment;

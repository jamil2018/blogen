import { Avatar, Card, CardContent, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import {
  calculateReadingTime,
  convertToText,
  getAuthorNameInitials,
} from "../utils/dataFormat";
import { getPostFormattedDate } from "../utils/dateUtils";
import { getBase64ImageURL } from "../utils/imageConvertion";

const useStyles = makeStyles((theme) => ({
  container: {
    height: theme.spacing(20),
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  authorInfoContainer: {
    marginBottom: theme.spacing(1),
  },
  postTitle: {
    textDecoration: "none",
    display: "block",
    color: theme.palette.text.primary,
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.subtitle1.fontSize,
    },
  },
  authorName: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
}));

const PostSummaryCard = ({
  postId,
  authorId,
  authorImageURL,
  authorName,
  postTitle,
  publishDate,
  description,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.container} variant="outlined" elevation={0}>
      <CardContent>
        <Grid
          container
          alignItems="center"
          className={classes.authorInfoContainer}
        >
          {authorImageURL ? (
            <Avatar
              className={classes.avatar}
              src={authorImageURL}
              alt={authorName}
            />
          ) : (
            <Avatar className={classes.avatar}>
              {getAuthorNameInitials(authorName)}
            </Avatar>
          )}
          <Typography
            className={classes.authorName}
            variant="caption"
            component={Link}
            to={`/authors/${authorId}`}
          >
            {authorName}
          </Typography>
        </Grid>
        <Typography
          className={classes.postTitle}
          variant="h6"
          gutterBottom
          component={Link}
          to={`/posts/${postId}`}
        >
          {postTitle}
        </Typography>
        <Typography variant="caption">
          {getPostFormattedDate(publishDate)} ·{" "}
          {calculateReadingTime(convertToText(description))} min read
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PostSummaryCard;

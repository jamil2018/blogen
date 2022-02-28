import { Avatar, Card, CardContent, Grid, Typography } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import {
  calculateReadingTime,
  convertToText,
  formatDate,
  getAuthorNameInitials,
} from "../utils/dataFormat";
import { getPostFormattedDate } from "../utils/dateUtils";
import { getBase64ImageURL } from "../utils/imageConvertion";

const useStyles = makeStyles((theme) => ({
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
  },
}));

const PostSummaryCard = ({
  postId,
  authorImage,
  authorName,
  postTitle,
  publishDate,
  description,
}) => {
  const classes = useStyles();
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid
          container
          alignItems="center"
          className={classes.authorInfoContainer}
        >
          {authorImage ? (
            <Avatar
              className={classes.avatar}
              src={getBase64ImageURL(authorImage)}
              alt={authorName}
            />
          ) : (
            <Avatar className={classes.avatar}>
              {getAuthorNameInitials(authorName)}
            </Avatar>
          )}
          <Typography variant="caption">{authorName}</Typography>
        </Grid>
        <Typography
          className={classes.postTitle}
          variant="h5"
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
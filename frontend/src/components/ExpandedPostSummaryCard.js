import makeStyles from "@material-ui/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import grey from "@material-ui/core/colors/grey";
import { Link } from "react-router-dom";
import { getPostFormattedDate } from "../utils/dateUtils";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(4, 0),
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  authorInfoContainer: {
    marginBottom: theme.spacing(2),
  },
  postTitle: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
  postDescription: {
    lineHeight: theme.spacing(0.2),
    textAlign: "justify",
  },
  postMeta: {
    marginTop: theme.spacing(2),
    color: grey[500],
  },
  tagsChip: {
    marginRight: theme.spacing(1),
    backgroundColor: grey[200],
    textDecoration: "none",
    color: theme.palette.text.primary,
    "&:hover": {
      cursor: "pointer",
      backgroundColor: grey[300],
    },
  },
  postImage: {
    width: "100%",
    height: theme.spacing(25),
    objectFit: "cover",
  },
}));

const ExpandedPostSummaryCard = ({
  authorName,
  authorImage,
  postId,
  postTitle,
  postImage,
  postSummary,
  postCreationDate,
  postReadingTime,
  postTags,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Grid
        spacing={2}
        container
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={9}>
          <Grid
            className={classes.authorInfoContainer}
            container
            alignItems="center"
          >
            <Avatar
              className={classes.avatar}
              alt={authorName}
              src={authorImage}
            />
            <Typography variant="body2">{authorName}</Typography>
          </Grid>
          <Box
            className={classes.postTitle}
            component={Link}
            to={`/posts/${postId}`}
          >
            <Typography variant="h5" component="h4" gutterBottom>
              {postTitle}
            </Typography>
            <Typography
              className={classes.postDescription}
              variant="body2"
              component="p"
            >
              {postSummary}
            </Typography>
          </Box>
          <Box className={classes.postMeta}>
            <Typography variant="body2" component="span">
              {getPostFormattedDate(postCreationDate)}
            </Typography>{" "}
            ·{" "}
            <Typography variant="body2" component="span">
              {postReadingTime} mins
            </Typography>{" "}
            ·{" "}
            {postTags.map((tag) => (
              <Chip
                component={Link}
                to={`/posts/search/tags/${tag}`}
                className={classes.tagsChip}
                size="small"
                label={tag}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={3}>
          <img className={classes.postImage} src={postImage} alt={postTitle} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpandedPostSummaryCard;

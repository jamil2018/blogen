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
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column-reverse",
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(1),
    },
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  authorInfoContainer: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  authorInfoContainerMobile: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      margin: theme.spacing(1, 0),
    },
  },
  authorName: {
    textDecoration: "none",
    color: theme.palette.text.primary,
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
  authorId,
  authorName,
  authorImageURL,
  postId,
  postTitle,
  postSummary,
  postCreationDate,
  postReadingTime,
  postTags,
  postImageURL,
}) => {
  const classes = useStyles();

  return (
    <>
      <Grid
        className={classes.authorInfoContainerMobile}
        container
        alignItems="center"
      >
        <Avatar
          className={classes.avatar}
          alt={authorName}
          src={authorImageURL}
        />
        <Typography
          component={Link}
          to={`/authors/${authorId}`}
          className={classes.authorName}
          variant="body2"
        >
          {authorName}
        </Typography>
      </Grid>
      <Grid
        spacing={2}
        container
        justifyContent="space-between"
        alignItems="center"
        className={classes.container}
      >
        <Grid item xs={12} sm={8}>
          <Grid
            className={classes.authorInfoContainer}
            container
            alignItems="center"
          >
            <Avatar
              className={classes.avatar}
              alt={authorName}
              src={authorImageURL}
            />
            <Typography
              component={Link}
              to={`/authors/${authorId}`}
              className={classes.authorName}
              variant="body2"
            >
              {authorName}
            </Typography>
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
            {postTags.map((tag, index) => (
              <Chip
                key={index}
                component={Link}
                to={`/posts/search/tags/${tag}`}
                className={classes.tagsChip}
                size="small"
                label={tag.toLowerCase()}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <img
            className={classes.postImage}
            src={postImageURL}
            alt={postTitle}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ExpandedPostSummaryCard;

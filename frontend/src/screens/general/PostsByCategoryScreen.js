import { CircularProgress, Divider, Grid, makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Alert } from "@material-ui/lab";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import ExpandedPostSummaryCard from "../../components/ExpandedPostSummaryCard";
import { getPostCategoryName } from "../../data/postQueryFunctions";
import { POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { calculateReadingTime } from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import { getBase64ImageURL } from "../../utils/imageConvertion";
import notFoundImage from "../../assets/notFound.svg";
import { useEffect } from "react";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import PostSummaryCardLoaderDeck from "../../components/PostSummaryCardLoaderDeck";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2, 0),
  },
  categoryTitle: {
    marginBottom: theme.spacing(4),
  },
  postsContainer: {
    margin: theme.spacing(2, 0),
  },
  loader: {
    minHeight: "40vh",
  },
  notFoundImage: {
    width: "100%",
    height: "40vh",
  },
}));

const PostsByCategoryScreen = () => {
  const classes = useStyles();
  const { categoryName } = useParams();
  const { data, isLoading, isFetching, isError } = useQuery(
    [POST_DATA, { categoryName }],
    ({ queryKey }) => getPostCategoryName(queryKey[1]),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 10 * 60 * 1000,
    }
  );

  // effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <section className={classes.container}>
      <Typography
        className={classes.categoryTitle}
        gutterBottom
        variant="h3"
        component="h1"
      >
        {categoryName}
      </Typography>
      <Divider />
      <div className={classes.postsContainer}>
        {isLoading || isFetching ? (
          <ExpandedPostSummaryLoaderDeck count={5} />
        ) : isError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert className={classes.root} severity="error">
                Error occurred while fetching data
              </Alert>
            </Typography>
          </Grid>
        ) : data.length < 1 ? (
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={6}>
              <img
                className={classes.notFoundImage}
                src={notFoundImage}
                alt="not found"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" component="h4" gutterBottom>
                No posts found under this category
              </Typography>
            </Grid>
          </Grid>
        ) : (
          data.map((post) => (
            <>
              <ExpandedPostSummaryCard
                key={post._id}
                authorImage={getBase64ImageURL(post.author.image.data.data)}
                authorName={post.author.name}
                postTitle={post.title}
                postDescription={post.description}
                postSummary={post.summary}
                postImage={getBase64ImageURL(post.image.data.data)}
                postCategory={post.category.title}
                postTags={post.tags}
                postId={post._id}
                postCreationDate={getPostFormattedDate(post.createdAt)}
                postReadingTime={calculateReadingTime(post.description)}
              />
              <Divider />
            </>
          ))
        )}
      </div>
    </section>
  );
};

export default PostsByCategoryScreen;

import { Divider, Grid, makeStyles, Typography } from "@material-ui/core";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import ExpandedPostSummaryCard from "../../components/ExpandedPostSummaryCard";
import { searchPostResults, searchPosts } from "../../data/postQueryFunctions";
import {
  SEARCH_POST_DATA,
  SEARCH_POST_DATA_RESULTS,
} from "../../definitions/reactQueryConstants/queryConstants";
import { calculateReadingTime } from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import notFoundImage from "../../assets/notFound.svg";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import { Alert } from "@material-ui/lab";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2, 0),
  },
  title: {
    marginBottom: theme.spacing(4),
    textTransform: "capitalize",
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

const SearchResultScreen = () => {
  const { searchQuery } = useParams();
  console.log(searchQuery);
  const classes = useStyles();

  const { isLoading, isFetching, isError, data } = useQuery(
    [SEARCH_POST_DATA_RESULTS, searchQuery],
    ({ queryKey }) => searchPostResults(queryKey[1]),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Result
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
                No posts found under the search query
              </Typography>
            </Grid>
          </Grid>
        ) : (
          data.map((post) => (
            <>
              <ExpandedPostSummaryCard
                key={post._id}
                authorImageURL={post.author.imageURL}
                authorName={post.author.name}
                authorId={post.author._id}
                postTitle={post.title}
                postDescription={post.description}
                postSummary={post.summary}
                postCategory={post.category.title}
                postTags={post.tags}
                postId={post._id}
                postCreationDate={getPostFormattedDate(post.createdAt)}
                postReadingTime={calculateReadingTime(post.description)}
                postImageURL={post.imageURL}
              />
              <Divider />
            </>
          ))
        )}
      </div>
    </>
  );
};

export default SearchResultScreen;

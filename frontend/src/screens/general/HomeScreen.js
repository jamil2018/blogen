import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import homeBg from "../../assets/homeBg.svg";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { useCallback, useRef, useState } from "react";
import PostSummaryCard from "../../components/PostSummaryCard";
import { useQuery } from "react-query";
import { Pagination, Skeleton } from "@material-ui/lab";
import {
  CATEGORY_DATA,
  LATEST_POST_DATA,
  PAGINATED_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import {
  getLatestPosts,
  getPaginatedPosts,
} from "../../data/postQueryFunctions";
import Alert from "@material-ui/lab/Alert";
import ExpandedPostSummaryCard from "../../components/ExpandedPostSummaryCard";
import { getBase64ImageURL } from "../../utils/imageConvertion";
import { calculateReadingTime } from "../../utils/dataFormat";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { Chip } from "@material-ui/core";
import { Link } from "react-router-dom";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import PostSummaryCardLoaderDeck from "../../components/PostSummaryCardLoaderDeck";
import CategoryLoaderDeck from "../../components/CategoryLoaderDeck";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(4, 0),
  },
  headerContent: {
    marginBottom: theme.spacing(6),
  },
  homeBg: {
    width: "100%",
    height: "50vh",
  },
  subHeader: {
    fontWeight: theme.typography.fontWeightLight,
  },
  latestArticlesHeaderText: {
    marginLeft: theme.spacing(0.3),
  },
  latestArticlesContainer: {
    margin: theme.spacing(4, 0),
    marginBottom: theme.spacing(8),
  },
  latestArticleHeader: {
    marginBottom: theme.spacing(2),
  },
  allPostsContainer: {
    margin: theme.spacing(2, 0),
  },
  categorySectionTitle: {
    marginTop: theme.spacing(3),
    fontSize: theme.typography.pxToRem(16),
  },
  paginationContainer: {
    marginTop: theme.spacing(8),
  },
  categoryChip: {
    marginRight: theme.spacing(2),
    margin: theme.spacing(1, 0),
    "&:hover": {
      cursor: "pointer",
      backgroundColor: grey[100],
    },
  },
}));

const HomeScreen = () => {
  //#region states
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  //#endregion

  //#region refs
  const allPostsContainerRef = useRef(null);
  //#endregion

  const classes = useStyles();

  //#region data queries
  const {
    data: latestPostData,
    isLoading: latestPostDataLoading,
    isFetching: latestPostDataFetching,
    isError: latestPostDataError,
  } = useQuery(LATEST_POST_DATA, getLatestPosts, {
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const {
    data: allPostData,
    isLoading: allPostDataLoading,
    isFetching: allPostDataFetching,
    isError: allPostDataError,
  } = useQuery(
    [PAGINATED_POST_DATA, { page: currentPage, limit: 5 }],
    ({ queryKey }) => getPaginatedPosts(queryKey[1]),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 10 * 60 * 1000,
    }
  );
  const {
    data: allCategoryData,
    isLoading: allCategoryDataLoading,
    isFetching: allCategoryDataFectching,
    isError: allCategoryDataError,
  } = useQuery(CATEGORY_DATA, getAllCategories, {
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  //#endregion

  //#region action handlers
  const handleLoginModalOpen = useCallback(() => {
    setOpenLoginModal(true);
  }, []);
  const handleLoginModalClose = useCallback(() => {
    setOpenLoginModal(false);
  }, []);
  const handleRegistrationModalOpen = useCallback(() => {
    setOpenRegistrationModal(true);
  }, []);
  const handleRegistrationModalClose = useCallback(() => {
    setOpenRegistrationModal(false);
  }, []);

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
    window.scrollTo(0, allPostsContainerRef.current.offsetTop);
  };
  //#endregion

  return (
    <>
      <header className={classes.header}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={6}>
            <div className={classes.headerContent}>
              <Typography variant="h2" component="h1" gutterBottom>
                Blogen is a place where creative minds grow
              </Typography>
              <Typography
                className={classes.subHeader}
                variant="h6"
                component="h4"
              >
                Share your knowledge and get inspired
              </Typography>
            </div>
            <Button
              onClick={() => setOpenLoginModal("true")}
              variant="contained"
              color="primary"
            >
              Start Sharing
            </Button>
          </Grid>
          <Grid item xs={6}>
            <img
              className={classes.homeBg}
              src={homeBg}
              alt="home background"
            />
          </Grid>
        </Grid>
      </header>
      <Divider />
      <section className={classes.latestArticlesContainer}>
        <Grid
          container
          alignItems="center"
          className={classes.latestArticleHeader}
        >
          <AutorenewIcon />
          <Typography
            className={classes.latestArticlesHeaderText}
            variant="subtitle2"
            component="h2"
            gutterBottom
          >
            LATEST ARTICLES
          </Typography>
        </Grid>
        {latestPostDataLoading || latestPostDataFetching ? (
          <PostSummaryCardLoaderDeck count={6} />
        ) : latestPostDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert className={classes.root} severity="error">
                Error occurred while fetching data
              </Alert>
            </Typography>
          </Grid>
        ) : (
          <Grid
            container
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
          >
            {latestPostData.map((post) => (
              <Grid item xs={4}>
                <PostSummaryCard
                  key={post.id}
                  postId={post._id}
                  authorImage={post.author.image.data.data}
                  authorName={post.author.name}
                  postTitle={post.title}
                  publishDate={post.createdAt}
                  description={post.description}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </section>
      <Divider />
      <section className={classes.allPostsContainer} ref={allPostsContainerRef}>
        <Grid
          spacing={10}
          container
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid item xs={8}>
            {allPostDataLoading || allPostDataFetching ? (
              <ExpandedPostSummaryLoaderDeck count={5} />
            ) : allPostDataError ? (
              <Grid container alignItems="center" justifyContent="center">
                <Typography variant="h6" component="h4" gutterBottom>
                  <Alert className={classes.root} severity="error">
                    Error occurred while fetching data
                  </Alert>
                </Typography>
              </Grid>
            ) : (
              <>
                {allPostData.docs.map((post) => (
                  <ExpandedPostSummaryCard
                    authorImage={getBase64ImageURL(post.author.image.data.data)}
                    authorName={post.author.name}
                    postId={post._id}
                    postTitle={post.title}
                    postSummary={post.summary}
                    postCreationDate={post.createdAt}
                    postReadingTime={calculateReadingTime(post.description)}
                    postTags={post.tags}
                    postImage={getBase64ImageURL(post.image.data.data)}
                  />
                ))}
                <Grid
                  className={classes.paginationContainer}
                  container
                  justifyContent="center"
                >
                  <Pagination
                    count={allPostData.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Grid item xs={4}>
            <Typography
              className={classes.categorySectionTitle}
              variant="h6"
              component="h4"
              gutterBottom
            >
              DISCOVER MORE OF WHAT MATTERS TO YOU
            </Typography>
            {allCategoryDataLoading || allCategoryDataFectching ? (
              <CategoryLoaderDeck count={8} />
            ) : allCategoryDataError ? (
              <Grid container alignItems="center" justifyContent="center">
                <Typography variant="h6" component="h4" gutterBottom>
                  <Alert className={classes.root} severity="error">
                    Error occurred while fetching data
                  </Alert>
                </Typography>
              </Grid>
            ) : (
              allCategoryData.map((category) => (
                <Chip
                  key={category._id}
                  component={Link}
                  to={`/posts/search/categories/${category.title}`}
                  className={classes.categoryChip}
                  label={category.title}
                  variant="outlined"
                />
              ))
            )}
          </Grid>
        </Grid>
      </section>
      {/* Modals */}
      <UserModal open={openLoginModal} onClose={handleLoginModalClose}>
        <LoginScreen
          openRegistrationModal={handleRegistrationModalOpen}
          handleModalClose={handleLoginModalClose}
        />
      </UserModal>
      <UserModal
        open={openRegistrationModal}
        onClose={handleRegistrationModalClose}
        expanded={true}
      >
        <RegisterScreen
          openLoginModal={handleLoginModalOpen}
          handleModalClose={handleRegistrationModalClose}
        />
      </UserModal>
    </>
  );
};

export default HomeScreen;

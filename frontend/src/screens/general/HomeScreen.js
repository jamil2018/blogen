import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import homeBg from "../../assets/homeBg.svg";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { useCallback, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Pagination } from "@material-ui/lab";
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
import { getAllCategories } from "../../data/categoryQueryFunctions";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import PostSummaryCardLoaderDeck from "../../components/PostSummaryCardLoaderDeck";
import CategoryLoaderDeck from "../../components/CategoryLoaderDeck";
import HomeAllPostsDeck from "../../components/HomeAllPostsDeck";
import HomeLatestPostsDeck from "../../components/HomeLatestPostsDeck";
import HomeCategoriesDeck from "../../components/HomeCategoriesDeck";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(4, 0),
  },
  headerTitle: {
    [theme.breakpoints.down("xs")]: {
      fontSize: theme.typography.h4.fontSize,
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.h3.fontSize,
    },
  },
  headerContent: {
    marginBottom: theme.spacing(6),
  },
  headerContentContainer: {
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column-reverse",
    },
  },
  homeBg: {
    width: "100%",
    height: "50vh",
  },
  subHeader: {
    fontWeight: theme.typography.fontWeightLight,
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.subtitle1.fontSize,
    },
  },
  headerCallContainer: {
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  sectionHeaderText: {
    marginLeft: theme.spacing(1),
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
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
  },
  categoriesContainer: {
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  paginationContainer: {
    marginTop: theme.spacing(8),
  },
  allPostsSectionHeaderContainer: {
    marginBottom: "-2rem",
    marginLeft: theme.spacing(0.8),
    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(1.5),
      marginLeft: theme.spacing(-0.1),
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
      keepPreviousData: true,
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

  const handlePageChange = useCallback((_, page) => {
    setCurrentPage(page);
    window.scrollTo(0, allPostsContainerRef.current.offsetTop);
  }, []);
  //#endregion

  return (
    <>
      <header className={classes.header}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          className={classes.headerContentContainer}
        >
          <Grid item xs={12} sm={6}>
            <div className={classes.headerContent}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                className={classes.headerTitle}
              >
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
            <Grid container className={classes.headerCallContainer}>
              <Button
                onClick={() => setOpenLoginModal("true")}
                variant="contained"
                color="primary"
              >
                Start Sharing
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
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
            className={classes.sectionHeaderText}
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
          <HomeLatestPostsDeck posts={latestPostData} />
        )}
      </section>
      <Divider />
      <section className={classes.allPostsContainer} ref={allPostsContainerRef}>
        <Grid
          container
          alignItems="center"
          className={classes.allPostsSectionHeaderContainer}
        >
          <LibraryBooksIcon />
          <Typography
            className={classes.sectionHeaderText}
            variant="subtitle2"
            component="h2"
            gutterBottom
          >
            ALL POSTS
          </Typography>
        </Grid>
        <Grid
          spacing={6}
          container
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid item xs={12} sm={8}>
            {allPostDataLoading || allPostDataFetching ? (
              <ExpandedPostSummaryLoaderDeck count={5} />
            ) : allPostDataError ? (
              <Grid container alignItems="center" justifyContent="center">
                <Typography variant="h6" component="h4" gutterBottom>
                  <Alert severity="error">
                    Error occurred while fetching data
                  </Alert>
                </Typography>
              </Grid>
            ) : (
              <>
                <HomeAllPostsDeck posts={allPostData.docs} />
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
          <Grid item xs={12} sm={4}>
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
              <Grid container className={classes.categoriesContainer}>
                <HomeCategoriesDeck categories={allCategoryData} />
              </Grid>
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

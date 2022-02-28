import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import homeBg from "../../assets/homeBg.svg";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { useState } from "react";
import PostSummaryCard from "../../components/PostSummaryCard";
import { useQuery } from "react-query";
import { POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { getAllPosts, getLatestPosts } from "../../data/postQueryFunctions";

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
  },
  latestArticleHeader: {
    marginBottom: theme.spacing(2),
  },
}));

const HomeScreen = () => {
  const classes = useStyles();
  const { data, isLoading, isFetching, isError, error } = useQuery(
    POST_DATA,
    getLatestPosts,
    { refetchOnWindowFocus: false, refetchInterval: 10 * 60 * 1000 }
  );
  // states
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);

  const modalCloseHandler = (modalType) => {
    switch (modalType) {
      case "LOGIN":
        setOpenLoginModal(false);
        break;
      case "REGISTER":
        setOpenRegistrationModal(false);
        break;
      default:
        return;
    }
  };
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
        {isLoading || isFetching ? (
          <Grid container alignItems="center" justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          <Grid
            container
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
          >
            {data.map((post) => (
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
            <Grid item xs={4}></Grid>
            <Grid item xs={4}></Grid>
          </Grid>
        )}
      </section>
      {/* Modals */}
      <UserModal open={openLoginModal} onClose={() => setOpenLoginModal(false)}>
        <LoginScreen
          openRegistrationModal={() => setOpenRegistrationModal(true)}
          handleModalClose={() => modalCloseHandler("LOGIN")}
        />
      </UserModal>
      <UserModal
        open={openRegistrationModal}
        onClose={() => setOpenRegistrationModal(false)}
        expanded={true}
      >
        <RegisterScreen
          openLoginModal={() => setOpenLoginModal(true)}
          handleModalClose={() => modalCloseHandler("REGISTER")}
        />
      </UserModal>
    </>
  );
};

export default HomeScreen;

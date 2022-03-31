import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import BlogenLogo from "../../assets/appIcon.svg";
import { useQuery } from "react-query";
import { getLatestUsers } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import UserSummaryCardDeck from "../../components/UserSummaryCardDeck";
import { Alert } from "@material-ui/lab";
import { grey } from "@material-ui/core/colors";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { useCallback, useState } from "react";

const useStyles = makeStyles((theme) => ({
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  header: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(8),
  },
  headerText: {
    padding: theme.spacing(4, 0),
    textAlign: "justify",
    lineHeight: theme.typography.pxToRem(30),
  },
  logo: {
    width: "50%",
  },
  bgPrimary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  bgDark: {
    backgroundColor: grey[900],
    color: theme.palette.getContrastText(grey[900]),
  },
  sectionText: {
    padding: theme.spacing(2, 0),
    textAlign: "center",
    lineHeight: theme.typography.pxToRem(30),
  },
  section: {
    margin: theme.spacing(6, 0),
    padding: theme.spacing(4),
  },
}));

const AboutUsScreen = () => {
  const classes = useStyles();

  // states
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);

  // data queries
  const { data, isLoading, isError } = useQuery(USER_DATA, getLatestUsers, {
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });

  // handlers
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
  return (
    <>
      <Typography
        className={classes.header}
        component="h1"
        variant="h2"
        gutterBottom
      >
        Everyone needs a <span className={classes.bold}>blog</span>
      </Typography>
      <Divider />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item xs={6}>
          <Typography
            className={classes.headerText}
            variant="body2"
            gutterBottom
          >
            Our thoughts define ourselves. Blogen is where those our thoughts
            get to meet reality, flow, and create insightful conversations.
            We’re a sharing platform where readers can come to find insightful
            and dynamic thinking of other inquisitive minds. Here, expert and
            undiscovered voices alike dive into the heart of any topic and spark
            new ideas come to the surface. Our purpose is to spread the thoughts
            of people and deepen understanding of the world among our readers.
            We’re pioneering a new way for digital publishing. One that supports
            nuance, complexity, and vital storytelling. This is an environment
            that is available to everyone, regardless of background. We’re a
            community of people who share the same passion for the world. We're
            promoter substance and authenticity. Blogen is the place where
            deeper connections forged between readers and writers can lead to
            discovery and growth. Together with all our collaborators, we’re
            building a trusted and vibrant ecosystem fueled by important ideas
            and the people who think about them.
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="center">
            <img className={classes.logo} src={BlogenLogo} alt="logo" />
          </Grid>
        </Grid>
      </Grid>
      {/* users */}
      <Box className={[classes.bgPrimary, classes.section].join(" ")}>
        <Typography variant="h3" component="h2" gutterBottom align="center">
          A Hive of Curious Minds
        </Typography>
        <Grid container justifyContent="center">
          <Grid item xs={6}>
            <Typography
              className={classes.sectionText}
              variant="body1"
              component="p"
              align="center"
            >
              Anyone can write on Blogen. Thinkers, experts, people with a
              unique perspective share their thoughts and ideas here. You'll
              find people from all around the globe on Blogen.
            </Typography>
          </Grid>
        </Grid>
        {isLoading ? (
          <>
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress color="secondary" />
            </Grid>
          </>
        ) : isError ? (
          <>
            <Grid container alignItems="center" justifyContent="center">
              <Typography variant="h6" component="h4" gutterBottom>
                <Alert severity="error">
                  Error occurred while fetching data
                </Alert>
              </Typography>
            </Grid>
          </>
        ) : (
          <UserSummaryCardDeck users={data} />
        )}
      </Box>
      {/* CTA for account creation */}
      <Box className={[classes.section, classes.bgDark].join(" ")}>
        <Typography variant="h3" component="h2" gutterBottom align="center">
          Make Blogen the place for your thoughts to take off
        </Typography>
        <Grid container justifyContent="center">
          <Grid item xs={6}>
            <Typography className={classes.sectionText} variant="body1">
              An empty page is also the starting point of a great idea. Blogen
              is the place where you can walk through it. Here it is very easy
              and completely free to share your thoughts on any subject, connect
              with people and express yourself with a range of publishing
              options.
            </Typography>
            <Grid container justifyContent="center" alignItems="center">
              <Button
                onClick={handleRegistrationModalOpen}
                variant="outlined"
                color="primary"
                size="large"
              >
                Write on Blogen
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
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

export default AboutUsScreen;

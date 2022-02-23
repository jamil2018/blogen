import { Button, Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import homeBg from "../../assets/homeBg.svg";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import { Link } from "react-router-dom";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { useState } from "react";

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
  latestArticles: {
    margin: theme.spacing(4, 0),
  },
}));

const HomeScreen = () => {
  const classes = useStyles();

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
      <section className={classes.latestArticles}>
        <Grid container alignItems="center">
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
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
        ></Grid>
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
          handleModalClose={() => modalCloseHandler("REGISTER")}
        />
      </UserModal>
    </>
  );
};

export default HomeScreen;

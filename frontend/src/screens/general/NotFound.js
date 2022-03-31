import { Button, Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import NotFoundImg from "../../assets/404.svg";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4, 0),
  },
  image: {
    width: "100%",
    height: "70vh",
  },
  heroText: {
    marginTop: theme.spacing(2),
  },
  returnLink: {
    marginTop: theme.spacing(2),
  },
}));

const NotFound = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img className={classes.image} src={NotFoundImg} alt="404" />
      <Typography
        className={classes.heroText}
        variant="h4"
        component="h1"
        align="center"
      >
        Oops!!! Page Not Found.
      </Typography>
      <Grid container justifyContent="center">
        <Button
          className={classes.returnLink}
          variant="text"
          color="primary"
          component={Link}
          to="/"
        >
          go back to Home Page
        </Button>
      </Grid>
    </div>
  );
};

export default NotFound;

import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ScreenTitle from "../../../components/ScreenTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  card: {
    minWidth: "25vw",
  },
}));

const AdminHomeScreen = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useSelector((state) => state.userData);

  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  return (
    <>
      <ScreenTitle text="Dashboard" className={classes.root} />
      <Grid container alignItems="center" justifyContent="space-between">
        <Card className={classes.card}>
          <CardContent>
            <Typography gutterBottom align="center" variant="h5" component="h2">
              Posts
            </Typography>
            <Typography align="center" variant="body1" component="p">
              25
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Typography gutterBottom align="center" variant="h5" component="h2">
              Users
            </Typography>
            <Typography align="center" variant="body1" component="p">
              15
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Typography gutterBottom align="center" variant="h5" component="h2">
              Categories
            </Typography>
            <Typography align="center" variant="body1" component="p">
              05
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default AdminHomeScreen;

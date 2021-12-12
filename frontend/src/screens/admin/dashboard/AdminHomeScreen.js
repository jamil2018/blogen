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
  },
  card: {
    minWidth: 275,
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
            <Typography variant="h5" component="h2">
              Posts
            </Typography>
            <Typography variant="body2" component="p">
              25
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Users
            </Typography>
            <Typography variant="body2" component="p">
              15
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Categories
            </Typography>
            <Typography variant="body2" component="p">
              5
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default AdminHomeScreen;

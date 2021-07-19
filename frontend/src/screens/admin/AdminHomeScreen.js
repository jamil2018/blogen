import { makeStyles } from "@material-ui/core";
import ScreenTitle from "../../components/ScreenTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));

const AdminHomeScreen = () => {
  const classes = useStyles();
  return (
    <>
      <ScreenTitle text="Dashboard" className={classes.root} />
    </>
  );
};

export default AdminHomeScreen;

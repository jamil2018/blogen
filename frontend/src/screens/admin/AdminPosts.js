import { makeStyles } from "@material-ui/core";
import ScreenTitle from "../../components/ScreenTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));
const AdminPosts = () => {
  const classes = useStyles();
  return <ScreenTitle text="Posts" className={classes.root} />;
};

export default AdminPosts;

import { makeStyles } from "@material-ui/core";
import ScreenTitle from "../../components/ScreenTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));
const AdminCategories = () => {
  const classes = useStyles();
  return <ScreenTitle text="Categories" className={classes.root} />;
};

export default AdminCategories;

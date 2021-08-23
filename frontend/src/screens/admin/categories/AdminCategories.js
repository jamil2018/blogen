import { makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ScreenTitle from "../../../components/ScreenTitle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));
const AdminCategories = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useSelector((state) => state.userData);

  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  return <ScreenTitle text="Categories" className={classes.root} />;
};

export default AdminCategories;

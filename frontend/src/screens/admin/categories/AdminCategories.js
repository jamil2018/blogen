import CreateIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  ButtonGroup,
  Grid,
  IconButton,
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
}));
const AdminCategories = () => {
  const { user } = useSelector((state) => state.userData);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  return (
    <>
      <ScreenTitle text="Categories" className={classes.root} />
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body1" component="h1">
          All Categories
        </Typography>
        <ButtonGroup
          className={classes.buttonGroup}
          color="primary"
          variant="outlined"
          aria-label="admin user action button group"
        >
          <IconButton
            aria-label="create"
            onClick={() => console.log("create action invoked")}
          >
            <CreateIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => console.log("edit action invoked")}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            // disabled={deleteDisabled}
            onClick={() => console.log("delete action invoked")}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      </Grid>
    </>
  );
};

export default AdminCategories;

import { makeStyles } from "@material-ui/core";

const userProfileStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(8),
  },
}));

export { userProfileStyles };

import { makeStyles } from "@material-ui/core";

const adminCategoryHomeStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  dataGridContainer: {
    height: "70vh",
    width: "100%",
  },
}));

const adminCategoryCreateStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    padding: theme.spacing(2),
  },
}));

const adminCategoryEditStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    padding: theme.spacing(2),
  },
}));

export {
  adminCategoryHomeStyles,
  adminCategoryCreateStyles,
  adminCategoryEditStyles,
};

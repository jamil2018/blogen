import { makeStyles } from "@material-ui/core";

const adminPostHomeStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  dataGridContainer: {
    height: "70vh",
    width: "100%",
  },
}));

const adminPostCreateStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    minWidth: 240,
    marginBottom: theme.spacing(2.5),
  },
  formContent: {
    padding: `${theme.spacing(4)}px 0px`,
    paddingRight: theme.spacing(4),
  },
  editor: {
    height: "50vh",
    border: "1px solid #ddd",
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    "& .ql-container": {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
    },
  },
  input: {
    display: "none",
  },
  inputGroup: {
    display: "block",
    marginBottom: theme.spacing(2),
  },
  inputLabel: {
    marginLeft: theme.spacing(1),
  },
  errorLabel: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(2),
    fontSize: "0.75rem",
    lineHeight: 1.66,
    letterSpacing: "0.03333em",
    display: "block",
  },
  submitBtn: {
    marginTop: theme.spacing(4),
  },
  returnLink: {
    marginTop: theme.spacing(2),
  },
}));

const adminPostEditStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    minWidth: 240,
    marginBottom: theme.spacing(2.5),
  },
  formContent: {
    padding: `${theme.spacing(4)}px 0px`,
    paddingRight: theme.spacing(4),
  },
  editor: {
    height: "50vh",
    border: "1px solid #ddd",
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    "& .ql-container": {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
    },
  },
  input: {
    display: "none",
  },
  inputGroup: {
    display: "block",
    marginBottom: theme.spacing(2),
  },
  inputLabel: {
    marginLeft: theme.spacing(1),
  },
  errorLabel: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(2),
    fontSize: "0.75rem",
    lineHeight: 1.66,
    letterSpacing: "0.03333em",
    display: "block",
  },
  submitBtn: {
    marginTop: theme.spacing(4),
  },
  returnLink: {
    marginTop: theme.spacing(2),
  },
}));

export { adminPostHomeStyles, adminPostCreateStyles, adminPostEditStyles };

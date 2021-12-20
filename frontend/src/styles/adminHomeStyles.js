import { makeStyles } from "@material-ui/core";

const adminHomeStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  card: {
    minWidth: "25vw",
    height: "15vh",
  },
  chart: {},
  chartContainer: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
  },
}));

export { adminHomeStyles };

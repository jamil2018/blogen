import { makeStyles } from "@material-ui/core";

const adminHomeStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  card: {
    minWidth: "100%",
    height: "15vh",
    marginBottom: theme.spacing(2),
  },
  cardItem: {
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0,
    },
  },
  chart: {},
  chartContainer: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
  },
  cardContent: {
    "&:last-child": {
      paddingBottom: 0,
    },
  },
}));

export { adminHomeStyles };

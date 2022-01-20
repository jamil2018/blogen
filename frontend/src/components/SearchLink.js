import { alpha, Link, makeStyles } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "block",
    font: "inherit",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    width: "100%",
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      textDecoration: "none",
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    "&:last-child": {
      marginBottom: 0,
    },
  },
}));

const SearchLink = ({ children, to }) => {
  const classes = useStyles();
  return (
    <Link className={classes.root} component={RouterLink} to={to}>
      {children}
    </Link>
  );
};

export default SearchLink;

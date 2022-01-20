import { Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  navLink: {
    marginRight: theme.spacing(2),
  },
}));

const NavLink = ({ text, handler, icon, variant, isLink, to }) => {
  const classes = useStyles();
  return isLink ? (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      component={Link}
      to={to}
    >
      {text}
    </Button>
  ) : (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      onClick={handler}
    >
      {text}
    </Button>
  );
};

export default NavLink;

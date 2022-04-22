import { Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  navLink: {
    marginRight: theme.spacing(2),
  },
}));

const NavLink = ({
  text,
  handler,
  icon,
  variant,
  isLink,
  to,
  closeDrawerHandler,
}) => {
  const classes = useStyles();

  // action handler
  const handleClick = () => {
    if (closeDrawerHandler) {
      closeDrawerHandler();
    }
    handler();
  };
  return isLink ? (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      component={Link}
      to={to}
      {...(closeDrawerHandler && { onClick: closeDrawerHandler })}
    >
      {text}
    </Button>
  ) : (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

export default NavLink;

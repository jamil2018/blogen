import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const ScreenTitle = ({ text, className }) => {
  const classes = useStyles();

  return (
    <Typography
      variant="h5"
      component="h1"
      className={`${className} ${classes.root}`}
      color="textPrimary"
    >
      {text}
    </Typography>
  );
};

export default ScreenTitle;

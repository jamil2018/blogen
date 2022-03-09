import { Grid, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
}));

const CategoryLoaderDeck = ({ count }) => {
  const classes = useStyles();
  return (
    <Grid container>
      {Array.from(Array(count).keys()).map((i) => (
        <Skeleton
          variant="rect"
          width={60}
          height={20}
          className={classes.root}
        />
      ))}
    </Grid>
  );
};

export default CategoryLoaderDeck;

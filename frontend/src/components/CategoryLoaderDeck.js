import { Grid } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';
import { memo } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  container: {
    justifyContent: "flex-end",
    [theme.breakpoints.down('sm')]: {
      justifyContent: "center",
    },
  },
}));

const CategoryLoaderDeck = memo(({ count, position = "flex-end" }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      className={classes.container}
      style={{ justifyContent: position }}
    >
      {Array.from(Array(count).keys()).map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={60}
          height={20}
          className={classes.root}
        />
      ))}
    </Grid>
  );
});

export default CategoryLoaderDeck;

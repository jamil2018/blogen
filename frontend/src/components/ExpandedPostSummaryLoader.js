import { Grid } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(4, 0),
  },
  authorInfoContainer: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  authorInfoContainerMobile: {
    display: "none",
    [theme.breakpoints.down('sm')]: {
      display: "flex",
    },
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  metaContainer: {
    marginTop: theme.spacing(2),
  },
  meta: {
    marginRight: theme.spacing(1),
  },
  imageLoader: {
    display: "block",
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  imageLoaderMobile: {
    display: "none",
    [theme.breakpoints.down('sm')]: {
      display: "block",
    },
  },
}));

const ExpandedPostSummaryLoader = () => {
  const classes = useStyles();
  return (
    <>
      <Grid
        className={classes.authorInfoContainerMobile}
        container
        alignItems="center"
      >
        <Skeleton variant="circular" className={classes.avatar} />
        <Skeleton variant="text" width={50} />
      </Grid>
      <Grid
        spacing={2}
        container
        alignItems="center"
        justifyContent="space-between"
        className={classes.container}
      >
        <Grid item xs={12} sm={4} className={classes.imageLoaderMobile}>
          <Skeleton variant="rectangular" width={"100%"} height={160} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Grid
            className={classes.authorInfoContainer}
            container
            alignItems="center"
          >
            <Skeleton variant="circular" className={classes.avatar} />
            <Skeleton variant="text" width={50} />
          </Grid>
          <Skeleton className={classes.title} variant="text" width={100} />
          <Skeleton variant="text" width={"100%"} />
          <Skeleton variant="text" width={"100%"} />
          <Skeleton variant="text" width={"100%"} />
          <Grid className={classes.metaContainer} container alignItems="center">
            <Skeleton className={classes.meta} variant="text" width={50} />
            <Skeleton variant="text" width={50} />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4} className={classes.imageLoader}>
          <Skeleton variant="rectangular" width={"100%"} height={160} />
        </Grid>
      </Grid>
    </>
  );
};

export default ExpandedPostSummaryLoader;

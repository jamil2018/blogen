import { Grid, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(4, 0),
  },
  authorInfoContainer: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  authorInfoContainerMobile: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
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
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  imageLoaderMobile: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
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
        <Skeleton variant="circle" className={classes.avatar} />
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
          <Skeleton variant="rect" width={"100%"} height={160} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Grid
            className={classes.authorInfoContainer}
            container
            alignItems="center"
          >
            <Skeleton variant="circle" className={classes.avatar} />
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
          <Skeleton variant="rect" width={"100%"} height={160} />
        </Grid>
      </Grid>
    </>
  );
};

export default ExpandedPostSummaryLoader;

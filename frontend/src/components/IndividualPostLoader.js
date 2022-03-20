import { Grid, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(2),
  },
  meta: {
    marginRight: theme.spacing(2),
  },
  image: {
    margin: theme.spacing(8, 0),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  tagsContainer: {
    margin: theme.spacing(6, 0),
  },
  tag: {
    marginRight: theme.spacing(2),
  },
}));

const IndividualPostLoader = () => {
  const classes = useStyles();
  return (
    <>
      <Grid container justifyContent="flex-start">
        <Skeleton variant="text" height={100} width={"50%"} />
      </Grid>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Skeleton
                className={classes.avatar}
                variant="circle"
                width={40}
                height={40}
              />
            </Grid>
            <Grid item>
              <Skeleton variant="text" width={100} />
              <Grid container>
                <Skeleton className={classes.meta} variant="text" width={100} />
                <Skeleton variant="text" width={50} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container>
            <Skeleton className={classes.meta} variant="rect" width={25} />
            <Skeleton className={classes.meta} variant="rect" width={25} />
            <Skeleton className={classes.meta} variant="rect" width={25} />
            <Skeleton variant="rect" width={25} />
          </Grid>
        </Grid>
      </Grid>
      <Skeleton
        className={classes.image}
        variant="rect"
        width={"100%"}
        height={400}
      />
      <Grid container justifyContent="center">
        <Skeleton className={classes.title} variant="text" width={"50%"} />
      </Grid>
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100%"} />
      <Grid
        className={classes.tagsContainer}
        container
        justifyContent="flex-start"
        alignItems="center"
      >
        <Skeleton className={classes.tag} variant="rect" width={50} />
        <Skeleton className={classes.tag} variant="rect" width={50} />
        <Skeleton className={classes.tag} variant="rect" width={50} />
      </Grid>
    </>
  );
};

export default IndividualPostLoader;

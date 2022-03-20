import { Skeleton } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  comment: {
    marginBottom: theme.spacing(2),
  },
}));

const PostCommentLoader = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Skeleton
        className={classes.comment}
        variant="rect"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rect"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rect"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rect"
        height={100}
        width={"100%"}
      />
    </div>
  );
};

export default PostCommentLoader;

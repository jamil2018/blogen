import { Skeleton } from '@mui/material';
import { makeStyles } from "@mui/styles";

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
        variant="rectangular"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rectangular"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rectangular"
        height={100}
        width={"100%"}
      />
      <Skeleton
        className={classes.comment}
        variant="rectangular"
        height={100}
        width={"100%"}
      />
    </div>
  );
};

export default PostCommentLoader;

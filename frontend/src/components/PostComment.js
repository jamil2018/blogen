import {
  Avatar,
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },
  authorText: {
    marginTop: theme.spacing(1),
    color: grey[500],
    fontWeight: theme.typography.fontWeightLight,
  },
  commentTextContainer: {
    alignSelf: "flex-start",
  },
}));

const PostComment = ({ authorName, commentText }) => {
  const classes = useStyles();
  return (
    <Card className={classes.container} elevation={1} variant="outlined">
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={2}>
            <Grid
              direction="column"
              container
              justifyContent="center"
              alignItems="center"
            >
              <Avatar>{authorName.split(" ").map((np) => np[0])}</Avatar>
              <Typography variant="subtitle2" className={classes.authorText}>
                {authorName}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={10} className={classes.commentTextContainer}>
            <Typography variant="subtitle1" color="secondary">
              {commentText}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PostComment;

import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "24vw",
    height: "20vh",
  },
  imageContainer: {
    marginRight: theme.spacing(2),
  },
  image: {
    width: "100%",
    height: "15vh",
    objectFit: "cover",
    padding: theme.spacing(1),
  },
  authorName: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
}));

const UserSummaryCard = ({ userProfileImage, name, bio, authorId }) => {
  const classes = useStyles();
  return (
    <Card className={classes.container}>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={5} className={classes.imageContainer}>
            <img
              className={classes.image}
              src={userProfileImage}
              alt="user profile"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography
              className={classes.authorName}
              component={Link}
              to={`/authors/${authorId}`}
              variant="h6"
              gutterBottom
            >
              {name}
            </Typography>
            <Typography variant="subtitle2">{bio}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserSummaryCard;

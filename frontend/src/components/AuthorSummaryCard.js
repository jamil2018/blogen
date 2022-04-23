import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import MailIcon from "@material-ui/icons/Mail";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2, 0),
  },
  cardContent: {
    "&:last-child": {
      paddingBottom: theme.spacing(2),
    },
  },
  authorName: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
  imageContainer: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      justifyContent: "center",
    },
  },
  authorImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    [theme.breakpoints.down("xs")]: {
      width: "70%",
      height: "auto",
    },
  },
  authorMeta: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
  },
  socialLinks: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  socialLink: {
    marginBottom: theme.spacing(-1),
  },
}));

const AuthorSummaryCard = ({ authorData }) => {
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.container}>
      <CardContent className={classes.cardContent}>
        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={2} className={classes.imageContainer}>
            <img
              className={classes.authorImage}
              src={authorData.imageURL}
              alt={authorData.name}
            />
          </Grid>
          <Grid
            container
            xs={12}
            sm={9}
            direction="column"
            justifyContent="space-between"
          >
            <Box className={classes.authorMeta}>
              <Typography
                variant="h5"
                component={Link}
                gutterBottom
                to={`/authors/${authorData._id}`}
                className={classes.authorName}
              >
                {authorData.name}
              </Typography>
              <Typography variant="body1" component="p">
                {authorData.bio}
              </Typography>
            </Box>
            <Grid
              className={classes.socialLinks}
              container
              alignItems="center"
              justifyContent="flex-start"
            >
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`mailto:${authorData.email}`);
                }}
                component={Link}
                color="primary"
                edge="start"
              >
                <MailIcon />
              </IconButton>
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                href={`https://www.facebook.com/${authorData.facebookId}`}
                component="a"
                target="_blank"
                color="primary"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                href={`https://twitter.com/${authorData.twitterId}`}
                component="a"
                target="_blank"
                color="primary"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                href={`https://www.linkedin.com/in/${authorData.linkedinId}`}
                component="a"
                target="_blank"
                color="primary"
                edge="end"
              >
                <LinkedInIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AuthorSummaryCard;

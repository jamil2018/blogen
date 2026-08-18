"use client";

import { Box, Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import Link from "next/link";
import MailIcon from "@mui/icons-material/Mail";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

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
    [theme.breakpoints.down('sm')]: {
      display: "flex",
      justifyContent: "center",
    },
  },
  authorImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    [theme.breakpoints.down('sm')]: {
      width: "70%",
      height: "auto",
    },
  },
  authorMeta: {
    [theme.breakpoints.down('sm')]: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
  },
  socialLinks: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
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
        <Grid container justifyContent="space-between" spacing={2}>
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
                href={`/authors/${authorData._id}`}
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
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`mailto:${authorData.email}`);
                }}
                color="primary"
                edge="start"
                size="large">
                <MailIcon />
              </IconButton>
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                href={`https://www.facebook.com/${authorData.facebookId}`}
                component="a"
                target="_blank"
                color="primary"
                size="large">
                <FacebookIcon />
              </IconButton>
              <IconButton
                className={classes.socialLink}
                aria-label="email author"
                href={`https://twitter.com/${authorData.twitterId}`}
                component="a"
                target="_blank"
                color="primary"
                size="large">
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
                size="large">
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

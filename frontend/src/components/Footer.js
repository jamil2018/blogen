import {
  Container,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Logo from "../assets/appIcon.svg";

const useStyles = makeStyles((theme) => ({
  container: {
    borderTop: `1px solid ${theme.palette.primary.main}`,
    marginTop: theme.spacing(8),
  },
  footerTextContainer: {
    margin: theme.spacing(1.5, 0),
  },
  footerTextHeader: {
    marginBottom: theme.spacing(1),
    letterSpacing: theme.spacing(0.5),
  },
  footerTextBody: {
    textAlign: "justify",
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightLight,
  },
  footerNavigationContainer: {
    marginTop: theme.spacing(1.5),
  },
  footerLogoImage: {
    width: theme.spacing(6),
  },
  footerLogoText: {
    fontWeight: theme.typography.fontWeightLight,
  },
}));
const Footer = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <Grid
          className={classes.footerTextContainer}
          container
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Grid item xs={12} sm={3}>
            <Typography
              className={classes.footerTextHeader}
              variant="h6"
              color="primary"
            >
              Learn More.
            </Typography>
            <Typography className={classes.footerTextBody} variant="subtitle2">
              Check out our about us page and learn more about us.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography
              className={classes.footerTextHeader}
              variant="h6"
              color="primary"
            >
              Customize your account.
            </Typography>
            <Typography className={classes.footerTextBody} variant="subtitle2">
              Make the blogen experience yours. Customize your profile to
              connect to your readers. Update your bio and add your social media
              links.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography
              className={classes.footerTextHeader}
              variant="h6"
              color="primary"
            >
              Write a story.
            </Typography>
            <Typography className={classes.footerTextBody} variant="subtitle2">
              Sign up and start writing your own stories. Join with a community
              of creative writers.
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Divider />
      <Container maxWidth="lg">
        <Grid
          className={classes.footerNavigationContainer}
          container
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item sm={3}>
            <Grid container justifyContent="flex-start" alignItems="center">
              <img src={Logo} alt="logo" className={classes.footerLogoImage} />
              <Typography
                className={classes.footerLogoText}
                variant="h5"
                color="primary"
              >
                Blogen
              </Typography>
            </Grid>
          </Grid>
          <Grid item sm={9}>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Typography variant="subtitle2" color="primary">
                &copy; {new Date().getFullYear()} Blogen. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Footer;

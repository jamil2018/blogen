import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { getAllPostsByAuthorId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import {
  POST_DATA,
  SINGLE_AUTHOR_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import {
  Avatar,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  Divider,
  Box,
} from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import { Alert, Skeleton } from "@material-ui/lab";
import { getBase64ImageURL } from "../../utils/imageConvertion";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import HomeAllPostsDeck from "../../components/HomeAllPostsDeck";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import { grey } from "@material-ui/core/colors";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    minHeight: "45vh",
  },
  leftContainer: {
    paddingRight: theme.spacing(4),
  },
  rightContainer: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: "inherit",
    padding: theme.spacing(2, 3),
  },
  postsContainer: {
    maxHeight: "70vh",
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(2, 3, 2, 0),
    marginTop: theme.spacing(2),
    "&::-webkit-scrollbar": {
      width: "0.4em",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: grey[200],
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  authorName: {
    fontWeight: theme.typography.fontWeightBold,
  },
  authorNameLoader: {
    marginTop: theme.spacing(2),
  },
  avatar: {
    height: theme.spacing(10),
    width: theme.spacing(10),
    marginBottom: theme.spacing(3),
  },
  socialLinks: {
    marginTop: theme.spacing(3),
  },
  socialLinkLoaderContainer: {
    marginTop: theme.spacing(3),
  },
  socialLinkLoader: {
    marginRight: theme.spacing(4),
  },
}));

const AuthorProfileScreen = () => {
  const { authorId } = useParams();
  const classes = useStyles();

  // effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // data queries
  const {
    data: authorData,
    isLoading: isAuthorDataLoading,
    isError: isAuthorDataError,
  } = useQuery([SINGLE_AUTHOR_DATA, authorId], ({ queryKey }) =>
    getUserById(queryKey[1])
  );

  const {
    data: authorPostData,
    isLoading: isAuthorPostDataLoading,
    isError: isAuthorPostDataError,
  } = useQuery([POST_DATA, authorId], ({ queryKey }) =>
    getAllPostsByAuthorId(queryKey[1])
  );

  return (
    <Grid
      className={classes.container}
      container
      justifyContent="space-between"
    >
      <Grid item xs={9} className={classes.leftContainer}>
        {isAuthorDataLoading ? (
          <Skeleton variant="text" height={40} width={"50%"} />
        ) : isAuthorDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert severity="error">Error occurred while fetching data</Alert>
            </Typography>
          </Grid>
        ) : (
          <>
            <Typography
              className={classes.authorName}
              variant="h4"
              component="h1"
              gutterBottom
            >
              {authorData.name}
            </Typography>
            <Divider />
          </>
        )}
        {isAuthorPostDataLoading ? (
          <ExpandedPostSummaryLoaderDeck count={5} />
        ) : isAuthorPostDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert severity="error">Error occurred while fetching data</Alert>
            </Typography>
          </Grid>
        ) : (
          <Box className={classes.postsContainer}>
            <HomeAllPostsDeck posts={authorPostData} />
          </Box>
        )}
      </Grid>
      <Grid className={classes.rightContainer} item xs={3}>
        {isAuthorDataLoading ? (
          <>
            <Skeleton variant="circle" height={90} width={90} />
            <Skeleton
              className={classes.authorNameLoader}
              variant="text"
              height={20}
              width={"50%"}
            />
            <Skeleton variant="text" height={20} width={"75%"} />
            <Grid
              container
              alignItems="center"
              justifyContent="flex-start"
              className={classes.socialLinkLoaderContainer}
            >
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rect"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rect"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rect"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rect"
                height={15}
                width={25}
              />
            </Grid>
          </>
        ) : isAuthorDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert severity="error">Error occurred while fetching data</Alert>
            </Typography>
          </Grid>
        ) : (
          <>
            {authorData.image ? (
              <Avatar
                alt="user profile image"
                className={classes.avatar}
                src={getBase64ImageURL(authorData.image.data.data)}
              />
            ) : (
              <Avatar alt="user profile image" className={classes.avatar}>
                {getAuthorNameInitials(authorData.name)}
              </Avatar>
            )}
            <Typography gutterBottom variant="subtitle2" component="h3">
              {authorData.name}
            </Typography>
            <Typography gutterBottom variant="body2" component="p">
              {authorData.bio}
            </Typography>
            <Grid
              className={classes.socialLinks}
              container
              alignItems="center"
              justifyContent="flex-start"
            >
              <IconButton
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
                aria-label="email author"
                href={`https://www.facebook.com/${authorData.facebookId}`}
                component="a"
                target="_blank"
                color="primary"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="email author"
                href={`https://twitter.com/${authorData.twitterId}`}
                component="a"
                target="_blank"
                color="primary"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label="email author"
                href={`https://www.linkedin.com/in/${authorData.linkedinId}`}
                component="a"
                target="_blank"
                color="primary"
              >
                <LinkedInIcon />
              </IconButton>
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default AuthorProfileScreen;

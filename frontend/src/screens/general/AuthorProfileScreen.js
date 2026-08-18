"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getAllPostsByAuthorId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import {
  POST_DATA,
  SINGLE_AUTHOR_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { Avatar, Grid, IconButton, Typography, Divider, Box } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import MailIcon from "@mui/icons-material/Mail";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Alert, Skeleton } from '@mui/material';
import { getBase64ImageURL } from "../../utils/imageConvertion";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import HomeAllPostsDeck from "../../components/HomeAllPostsDeck";
import ExpandedPostSummaryLoaderDeck from "../../components/ExpandedPostSummaryLoaderDeck";
import { grey } from "@mui/material/colors";
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

const AuthorProfileScreen = (props) => {
  const { authorId: authorIdProp, author, posts } = props || {};
  const params = useParams();
  const authorId = authorIdProp ?? params?.authorId;
  const classes = useStyles();

  // effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // data queries
  const hasAuthor = author !== undefined;
  const {
    data: queriedAuthorData,
    isLoading: queriedAuthorDataLoading,
    isError: queriedAuthorDataError,
  } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, authorId],

    queryFn: ({ queryKey }) =>
      getUserById(queryKey[1]),
    enabled: !hasAuthor && Boolean(authorId),
  });
  const authorData = hasAuthor ? author : queriedAuthorData;
  const isAuthorDataLoading = hasAuthor ? false : queriedAuthorDataLoading;
  const isAuthorDataError = hasAuthor ? false : queriedAuthorDataError;

  const hasPosts = posts !== undefined;
  const {
    data: queriedAuthorPostData,
    isLoading: queriedAuthorPostDataLoading,
    isError: queriedAuthorPostDataError,
  } = useQuery({
    queryKey: [POST_DATA, authorId],

    queryFn: ({ queryKey }) =>
      getAllPostsByAuthorId(queryKey[1]),
    enabled: !hasPosts && Boolean(authorId),
  });
  const authorPostData = hasPosts ? posts : queriedAuthorPostData;
  const isAuthorPostDataLoading = hasPosts
    ? false
    : queriedAuthorPostDataLoading;
  const isAuthorPostDataError = hasPosts ? false : queriedAuthorPostDataError;

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
            <Skeleton variant="circular" height={90} width={90} />
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
                variant="rectangular"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rectangular"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rectangular"
                height={15}
                width={25}
              />
              <Skeleton
                className={classes.socialLinkLoader}
                variant="rectangular"
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
            {authorData.imageURL ? (
              <Avatar
                alt="user profile image"
                className={classes.avatar}
                src={authorData.imageURL}
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
                aria-label="email author"
                href={`https://www.facebook.com/${authorData.facebookId}`}
                component="a"
                target="_blank"
                color="primary"
                size="large">
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="email author"
                href={`https://twitter.com/${authorData.twitterId}`}
                component="a"
                target="_blank"
                color="primary"
                size="large">
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label="email author"
                href={`https://www.linkedin.com/in/${authorData.linkedinId}`}
                component="a"
                target="_blank"
                color="primary"
                size="large">
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

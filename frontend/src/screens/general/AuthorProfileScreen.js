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
} from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import { Alert, Skeleton } from "@material-ui/lab";
import { getBase64ImageURL } from "../../utils/imageConvertion";
import { getAuthorNameInitials } from "../../utils/dataFormat";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    minHeight: "45vh",
  },
  leftContainer: {
    marginRight: theme.spacing(2),
  },
  rightContainer: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: "inherit",
    padding: theme.spacing(2, 3),
  },
  authorName: {
    fontWeight: theme.typography.fontWeightBold,
  },
  avatar: {
    height: theme.spacing(10),
    width: theme.spacing(10),
    marginBottom: theme.spacing(3),
  },
  socialLinks: {
    marginTop: theme.spacing(3),
  },
}));

const AuthorProfileScreen = () => {
  const { authorId } = useParams();
  const classes = useStyles();

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
      <Grid item xs={9}>
        {isAuthorDataLoading || isAuthorPostDataLoading ? (
          <Skeleton variant="text" height={40} width={"50%"} />
        ) : isAuthorDataError || isAuthorPostDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert severity="error">Error occurred while fetching data</Alert>
            </Typography>
          </Grid>
        ) : (
          <Typography
            className={classes.authorName}
            variant="h4"
            component="h1"
          >
            {authorData.name}
          </Typography>
        )}
      </Grid>
      <Grid className={classes.rightContainer} item xs={3}>
        {isAuthorDataLoading || isAuthorPostDataLoading ? (
          <Skeleton variant="circle" height={100} width={100} />
        ) : isAuthorDataError || isAuthorPostDataError ? (
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

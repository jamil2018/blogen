import {
  Avatar,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import PostCommentDeck from "../../components/PostCommentDeck";
import PostTagDeck from "../../components/PostTagDeck";
import { getPostById } from "../../data/postQueryFunctions";
import {
  COMMENT_DATA,
  SINGLE_AUTHOR_DATA,
  SINGLE_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import CreateCommentScreen from "./CreateCommentScreen";
import {
  calculateReadingTime,
  convertToText,
  getAuthorNameInitials,
} from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import { getBase64ImageURL } from "../../utils/imageConvertion";
import ReactQuill from "react-quill";
import CreateIcon from "@material-ui/icons/Create";
import DeleteCommentScreen from "./DeleteCommentScreen";
import AdminModal from "../../components/AdminModal";
import ErrorIcon from "@material-ui/icons/Error";
import EditCommentScreen from "./EditCommentScreen";
import MailIcon from "@material-ui/icons/Mail";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import { getUserById } from "../../data/userQueryFunctions";
import IndividualPostLoader from "../../components/IndividualPostLoader";
import PostCommentLoader from "../../components/PostCommentLoader";
import { getCommentsByPostId } from "../../data/commentQueryFunctions";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
  },
  authorName: {
    marginLeft: theme.spacing(2),
    textDecoration: "none",
  },
  avatar: {
    height: theme.spacing(5),
    width: theme.spacing(5),
  },
  authorInfoContainer: {
    marginTop: theme.spacing(2),
  },
  postMeta: {
    color: grey[500],
    marginLeft: theme.spacing(2),
  },
  postReadingTime: {
    color: grey[500],
    marginLeft: theme.spacing(2),
  },
  postImg: {
    width: "100%",
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
  socialLinks: {
    marginTop: theme.spacing(2),
  },
  postContent: {
    "& .ql-container": {
      fontFamily: theme.typography.fontFamily,
      zIndex: theme.zIndex.tooltip,
      fontSize: theme.typography.subtitle1.fontSize,
    },
    "& .ql-editor": {
      padding: 0,
      lineHeight: "2em",
      textAlign: "justify",
    },
  },
  tagsContainer: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(4),
  },
  commentsHeader: {
    margin: theme.spacing(4, 0),
  },
  loader: {
    minHeight: "35vh",
  },
}));

const IndividualPostScreen = () => {
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [modificationCommentId, setModificationCommentId] = useState(null);

  const { postId } = useParams();
  const classes = useStyles();
  const { isLoading, data } = useQuery(
    [SINGLE_POST_DATA, postId],
    ({ queryKey }) => getPostById(queryKey[1])
  );
  const {
    isLoading: isPostCommentLoading,
    data: postCommentData,
    isFetching: isPostCommentFetching,
  } = useQuery([COMMENT_DATA, postId], ({ queryKey }) =>
    getCommentsByPostId(queryKey[1])
  );
  const authorId = data?.author._id;
  const { isLoading: isAuthorDataLoading, data: authorData } = useQuery(
    [SINGLE_AUTHOR_DATA, authorId],
    ({ queryKey }) => getUserById(queryKey[1]),
    { enabled: !!authorId }
  );
  // effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // action handlers
  const handleDeleteComment = (commentId) => {
    setModificationCommentId(commentId);
    setShowDeleteCommentModal(true);
  };

  const handleEditComment = (commentId) => {
    setModificationCommentId(commentId);
    setShowEditCommentModal(true);
  };
  return (
    <Container maxWidth="md" className={classes.container}>
      {isLoading || isAuthorDataLoading ? (
        <Grid
          className={classes.loader}
          container
          alignItems="center"
          justifyContent="center"
        >
          <IndividualPostLoader />
        </Grid>
      ) : (
        <>
          <Typography variant="h2" component="h1">
            {data.title}
          </Typography>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Grid
                container
                justifyContent="flex-start"
                alignItems="center"
                className={classes.authorInfoContainer}
              >
                <Grid item>
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
                </Grid>
                <Grid item>
                  <Typography
                    color="primary"
                    variant="subtitle2"
                    className={classes.authorName}
                    component={Link}
                    to={`/authors/${data.author._id}`}
                  >
                    {data.author.name}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.postMeta}>
                    {getPostFormattedDate(data.createdAt)} ·{" "}
                    {calculateReadingTime(convertToText(data.description))} min
                    read
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
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
                  edge="end"
                >
                  <LinkedInIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <img
            className={classes.postImg}
            src={getBase64ImageURL(data.image.data.data)}
            alt="post"
          />
          <ReactQuill
            theme="bubble"
            value={data.description}
            id="description"
            placeholder="Description"
            className={classes.postContent}
            name="description"
            readOnly
          />
          <PostTagDeck tags={data.tags} />
          <Divider />
          <Typography
            variant="h6"
            component="h2"
            className={classes.commentsHeader}
            color="secondary"
          >
            See what others say about this post
          </Typography>
          {isPostCommentLoading || isPostCommentFetching ? (
            <PostCommentLoader />
          ) : (
            <PostCommentDeck
              comments={postCommentData}
              postId={postId}
              deleteHandler={(commentId) => handleDeleteComment(commentId)}
              editHandler={(commentId) => handleEditComment(commentId)}
            />
          )}
          <CreateCommentScreen postId={postId} />
        </>
      )}
      {/* modals */}
      <AdminModal
        modalOpenState={showDeleteCommentModal}
        modalCloseHandler={() => setShowDeleteCommentModal(false)}
        modalTitle={"Delete comment"}
        modalIcon={<ErrorIcon fontSize="large" color="secondary" />}
      >
        <DeleteCommentScreen
          handleModalClose={() => setShowDeleteCommentModal(false)}
          commentId={modificationCommentId}
          postId={postId}
        />
      </AdminModal>
      <AdminModal
        modalOpenState={showEditCommentModal}
        modalCloseHandler={() => setShowEditCommentModal(false)}
        modalTitle={`Edit comment`}
        modalIcon={<CreateIcon fontSize="large" color="secondary" />}
      >
        <EditCommentScreen
          modalCloseHandler={() => setShowEditCommentModal(false)}
          commentId={modificationCommentId}
          postId={postId}
        />
      </AdminModal>
    </Container>
  );
};

export default IndividualPostScreen;

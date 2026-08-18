"use client";

import { Avatar, Container, Divider, Grid, IconButton, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
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
import CreateIcon from "@mui/icons-material/Create";
import DeleteCommentScreen from "./DeleteCommentScreen";
import AdminModal from "../../components/AdminModal";
import ErrorIcon from "@mui/icons-material/Error";
import EditCommentScreen from "./EditCommentScreen";
import MailIcon from "@mui/icons-material/Mail";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { getUserById } from "../../data/userQueryFunctions";
import IndividualPostLoader from "../../components/IndividualPostLoader";
import PostCommentLoader from "../../components/PostCommentLoader";
import { getCommentsByPostId } from "../../data/commentQueryFunctions";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
  },
  postTitle: {
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.h3.fontSize,
    },
  },
  authorName: {
    marginLeft: theme.spacing(2),
    textDecoration: "none",
  },
  avatar: {
    height: theme.spacing(5),
    width: theme.spacing(5),
    zIndex: -100,
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
    [theme.breakpoints.down('md')]: {
      display: "none",
    },
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

const IndividualPostScreen = (props) => {
  const { postId: postIdProp, post, author } = props || {};
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [modificationCommentId, setModificationCommentId] = useState(null);
  const [modules, setModules] = useState(null);

  const params = useParams();
  const postId = postIdProp ?? params?.postId;
  const classes = useStyles();
  const hasPost = post !== undefined;
  const { isLoading: queriedIsLoading, data: queriedPost } = useQuery({
    queryKey: [SINGLE_POST_DATA, postId],
    queryFn: ({ queryKey }) => getPostById(queryKey[1]),
    enabled: !hasPost && Boolean(postId),
    refetchOnWindowFocus: false,
  });
  const data = hasPost ? post : queriedPost;
  const isLoading = hasPost ? false : queriedIsLoading;
  const {
    isLoading: isPostCommentLoading,
    data: postCommentData,
    isFetching: isPostCommentFetching,
  } = useQuery({
    queryKey: [COMMENT_DATA, postId],
    queryFn: ({ queryKey }) => getCommentsByPostId(queryKey[1]),
    enabled: Boolean(postId),
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
  });
  const hasAuthor = author !== undefined;
  const authorId = data?.author._id;
  const { isLoading: queriedAuthorDataLoading, data: queriedAuthorData } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, authorId],
    queryFn: ({ queryKey }) => getUserById(queryKey[1]),
    enabled: !hasAuthor && !!authorId,
    refetchOnWindowFocus: false,
  });
  const authorData = hasAuthor ? author : queriedAuthorData;
  const isAuthorDataLoading = hasAuthor ? false : queriedAuthorDataLoading;
  // effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    let cancelled = false;
    import("../../definitions/editorModules").then((mod) => {
      if (!cancelled) {
        setModules(mod.modules);
      }
    });
    return () => {
      cancelled = true;
    };
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
          <Typography variant="h2" component="h1" className={classes.postTitle}>
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
                </Grid>
                <Grid item>
                  <Typography
                    color="primary"
                    variant="subtitle2"
                    className={classes.authorName}
                    component={Link}
                    href={`/authors/${data.author._id}`}
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
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`mailto:${authorData.email}`);
                  }}
                  color="primary"
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
                  edge="end"
                  size="large">
                  <LinkedInIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <img className={classes.postImg} src={data.imageURL} alt="post" />
          {modules ? (
            <ReactQuill
              theme="bubble"
              value={data.description}
              id="description"
              placeholder="Description"
              className={classes.postContent}
              name="description"
              modules={modules}
              readOnly
            />
          ) : (
            <div
              className={classes.postContent}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
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

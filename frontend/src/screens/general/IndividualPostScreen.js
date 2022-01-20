import {
  Avatar,
  CircularProgress,
  Container,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import PostCommentDeck from "../../components/PostCommentDeck";
import PostTagDeck from "../../components/PostTagDeck";
import { getPostById } from "../../data/postQueryFunctions";
import { SINGLE_POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import CreateCommentScreen from "./CreateCommentScreen";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import { toBase64 } from "../../utils/imageConvertion";
import ReactQuill from "react-quill";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
  },
  authorName: {
    marginLeft: theme.spacing(2),
  },
  authorInfoContainer: {
    marginTop: theme.spacing(2),
  },
  postDate: {
    color: grey[500],
    marginLeft: theme.spacing(2),
  },
  postImg: {
    width: "100%",
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
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
    minHeight: "40vh",
  },
}));

const IndividualPostScreen = () => {
  const { postId } = useParams();
  const classes = useStyles();
  const { isLoading, isError, data, isFetching } = useQuery(
    [SINGLE_POST_DATA, postId],
    ({ queryKey }) => getPostById(queryKey[1])
  );
  return (
    <Container maxWidth="md" className={classes.container}>
      {isLoading ? (
        <Grid
          className={classes.loader}
          container
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Typography variant="h2" component="h1">
            {data.title}
          </Typography>
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            className={classes.authorInfoContainer}
          >
            <Grid item>
              <Avatar>{getAuthorNameInitials(data.author.name)}</Avatar>
            </Grid>
            <Grid item>
              <Typography
                color="primary"
                variant="subtitle2"
                className={classes.authorName}
              >
                {data.author.name}
              </Typography>
              <Typography variant="subtitle2" className={classes.postDate}>
                {getPostFormattedDate(data.createdAt)}
              </Typography>
            </Grid>
          </Grid>
          <img
            className={classes.postImg}
            src={`data:image/*;base64,${toBase64(data.image.data.data)}`}
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
          <PostCommentDeck postId={postId} />
          <CreateCommentScreen postId={postId} />
        </>
      )}
    </Container>
  );
};

export default IndividualPostScreen;

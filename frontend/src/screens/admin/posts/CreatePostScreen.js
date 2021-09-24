import { makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { createPost } from "../../../data/postQueryFunctions";
import ScreenTitle from "../../../components/ScreenTitle";
import { POST_DATA } from "../../../definitions/reactQueryConstants/queryConstants";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));

const CreatePostScreen = () => {
  const classes = useStyles();
  const history = useHistory();
  // title, description, summary, category, tags, image
  const queryClient = useQueryClient();
  const mutation = useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(POST_DATA);
      history.push("/admin/posts");
    },
  });
  return (
    <>
      <ScreenTitle text="Create a new post" className={classes.root} />
    </>
  );
};

export default CreatePostScreen;

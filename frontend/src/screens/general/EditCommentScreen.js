import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getCommentByPostIdCommentId,
  updateCommentByPostIdCommentId,
} from "../../data/commentQueryFunctions";
import * as yup from "yup";
import {
  COMMENT_DATA,
  SINGLE_COMMENT_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { Button, makeStyles, TextField } from "@material-ui/core";
import { memo } from "react";

const validationSchema = yup.object({
  text: yup
    .string("Please enter comment text")
    .required("This field is required"),
});
const useStyles = makeStyles((theme) => ({
  formContent: {
    marginTop: theme.spacing(6),
    padding: theme.spacing(2),
  },
}));

const EditCommentScreen = memo(({ postId, commentId, modalCloseHandler }) => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { isLoading, isError, data } = useQuery(
    [SINGLE_COMMENT_DATA, { postId, commentId }],
    ({ queryKey }) => getCommentByPostIdCommentId(queryKey[1])
  );

  const mutation = useMutation(updateCommentByPostIdCommentId, {
    onSuccess: () => {
      queryClient.invalidateQueries(COMMENT_DATA);
      modalCloseHandler();
    },
  });
  const formik = useFormik({
    initialValues: {
      text: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        postId: postId,
        commentId: commentId,
        values: {
          text: values.text,
        },
      });
    },
  });
  if (!isLoading && !isError) {
    formik.initialValues.text = data.text;
  }
  return (
    <>
      <form onSubmit={formik.handleSubmit} className={classes.formContent}>
        <TextField
          fullWidth
          variant="outlined"
          id="text"
          name="text"
          label="Post a comment"
          value={formik.values.text}
          onChange={formik.handleChange}
          error={formik.touched.text && Boolean(formik.errors.text)}
          helperText={(formik.touched.text && formik.errors.text) || " "}
          size="small"
          multiline={true}
          rows={5}
        />
        <Button color="primary" variant="outlined" type="submit">
          Save
        </Button>
      </form>
    </>
  );
});

export default EditCommentScreen;

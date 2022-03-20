import { useFormik } from "formik";
import { useMutation, useQueryClient } from "react-query";
import { createCommentByPostId } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import * as yup from "yup";
import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useSelector } from "react-redux";

const validationSchema = yup.object({
  text: yup
    .string("Please enter comment text")
    .required("This field is required"),
});

const useStyles = makeStyles((theme) => ({
  formContent: {
    marginTop: theme.spacing(6),
  },
  hideAlert: {
    display: "none",
  },
}));
const CreateCommentScreen = ({ postId, showSuccessAlertHandler }) => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.userData);
  const { isLoading, mutate } = useMutation(createCommentByPostId, {
    onSuccess: () => {
      queryClient.invalidateQueries(COMMENT_DATA);
      formik.values.text = "";
    },
  });
  const classes = useStyles();
  const formik = useFormik({
    initialValues: {
      text: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutate({ postId, values });
    },
  });
  return (
    <Box>
      <Alert severity="warning" className={user._id ? classes.hideAlert : ""}>
        You need to be logged in to post comments
      </Alert>
      <form onSubmit={formik.handleSubmit} className={classes.formContent}>
        {user._id ? (
          <>
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
              disabled={!isLoading ? false : true}
            />
            <Button
              color="primary"
              variant="outlined"
              type="submit"
              disabled={!isLoading ? false : true}
            >
              Save
            </Button>
          </>
        ) : (
          <>
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
              disabled={true}
            />
            <Button
              color="primary"
              variant="outlined"
              type="submit"
              disabled={true}
            >
              Save
            </Button>
          </>
        )}
      </form>
    </Box>
  );
};

export default CreateCommentScreen;

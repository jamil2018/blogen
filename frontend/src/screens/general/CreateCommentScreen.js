import { useFormik } from "formik";
import { useMutation, useQueryClient } from "react-query";
import { createCommentByPostId } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import * as yup from "yup";
import { Box, Button, makeStyles, TextField } from "@material-ui/core";

const validationSchema = yup.object({
  text: yup
    .string("Please enter comment text")
    .required("This field is required"),
});

const useStyles = makeStyles((theme) => ({
  formContent: {
    marginTop: theme.spacing(6),
  },
}));
const CreateCommentScreen = ({ postId, showSuccessAlertHandler }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(createCommentByPostId, {
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
      mutation.mutate({ postId, values });
    },
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit} className={classes.formContent}>
        <TextField
          fullWidth
          variant="outlined"
          id="text"
          name="text"
          label="Post a comment"
          value={formik.values.text}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
    </Box>
  );
};

export default CreateCommentScreen;

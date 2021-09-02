import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "react-query";
import * as yup from "yup";
import { createCategory } from "../../../data/categoryQueryFunctions";
import { CATEGORY_DATA } from "../../../definitions/reactQueryConstants/queryConstants";

const validationSchema = yup.object({
  title: yup.string("Enter category title").required("This field is required"),
});

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    padding: theme.spacing(2),
  },
}));

const CreateCategoryScreen = ({
  showSuccessAlertHandler,
  handleModalClose,
}) => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const mutation = useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_DATA);
      showSuccessAlertHandler();
    },
  });
  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        title: values.title,
      });
      handleModalClose();
    },
  });
  return (
    <Box>
      <form onSubmit={formik.handleSubmit} className={classes.formContent}>
        <TextField
          fullWidth
          variant="outlined"
          id="title"
          name="title"
          label="Title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={(formik.touched.title && formik.errors.title) || " "}
          size="small"
        />
        <Button
          color="primary"
          variant="outlined"
          type="submit"
          fullWidth
          className={classes.button}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default CreateCategoryScreen;

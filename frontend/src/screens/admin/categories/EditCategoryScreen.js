import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
} from "@material-ui/core";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "react-query";
import * as yup from "yup";
import CreateIcon from "@material-ui/icons/Create";
import {
  getCategoryById,
  updateCategoryById,
} from "../../../data/categoryQueryFunctions";
import {
  CATEGORY_DATA,
  SINGLE_CATEGORY_DATA,
} from "../../../definitions/reactQueryConstants/queryConstants";
import { adminCategoryEditStyles } from "../../../styles/adminCategoryStyles";

const validationSchema = yup.object({
  title: yup.string("Enter category title").required("This field is required"),
});

const EditCategoryScreen = ({
  showSuccessAlertHandler,
  handleModalClose,
  categoryId,
}) => {
  const classes = adminCategoryEditStyles();
  const queryClient = useQueryClient();
  const { isLoading, isError, data } = useQuery(
    [SINGLE_CATEGORY_DATA, categoryId],
    ({ queryKey }) => getCategoryById(queryKey[1])
  );

  const mutation = useMutation(updateCategoryById, {
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
        categoryId: categoryId,
        values: {
          title: values.title,
        },
      });
      handleModalClose();
    },
  });

  if (!isLoading && !isError) {
    formik.initialValues.title = data.title;
  }

  return (
    <Box>
      {isLoading && !isError ? (
        <Grid container alignItems="center" justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
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
            startIcon={<CreateIcon />}
          >
            Update
          </Button>
        </form>
      )}
    </Box>
  );
};

export default EditCategoryScreen;

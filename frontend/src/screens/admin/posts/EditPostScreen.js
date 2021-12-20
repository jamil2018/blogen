import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getPostById, updatePostById } from "../../../data/postQueryFunctions";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import * as yup from "yup";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ReactQuill from "react-quill";
import ScreenTitle from "../../../components/ScreenTitle";
import "react-quill/dist/quill.bubble.css";
import CreateIcon from "@material-ui/icons/Create";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import { getAllCategories } from "../../../data/categoryQueryFunctions";
import {
  CATEGORY_DATA,
  SINGLE_POST_DATA,
} from "../../../definitions/reactQueryConstants/queryConstants";
import { adminPostEditStyles } from "../../../styles/adminPostStyles";

const validationSchema = yup.object({
  title: yup.string("Enter post title").required("This field is required"),
  summary: yup
    .string("Enter post summary")
    .required("This field is required")
    .min(150)
    .max(300),
  category: yup
    .string("Select post category")
    .required("This field is required"),
  image: yup.mixed().required("You need an image for your post"),
  description: yup
    .string("Enter post description")
    .required("This field is required"),
});

const EditPostScreen = () => {
  const classes = adminPostEditStyles();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.userData);
  const { editPostId } = useParams();
  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  const {
    isLoading: isUserDataLoading,
    isError: isUserDataError,
    data: userData,
  } = useQuery([SINGLE_POST_DATA, editPostId], ({ queryKey }) =>
    getPostById(queryKey[1])
  );
  const mutation = useMutation(updatePostById, {
    onSuccess: () => {
      queryClient.invalidateQueries("posts");
      history.push("/admin/posts");
    },
  });
  const { data, isLoading, isError } = useQuery(
    CATEGORY_DATA,
    getAllCategories
  );
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      summary: "",
      category: "",
      tags: [],
      image: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      values.tags =
        values.tags.length > 0
          ? values.tags.split(",").map((tag) => tag.trim())
          : values.tags;

      mutation.mutate({
        postId: editPostId,
        values: {
          title: values.title,
          description: values.description,
          summary: values.summary,
          category: values.category,
          tags: values.tags,
          image: values.image,
        },
      });
    },
  });
  if (!isUserDataLoading && !isUserDataError) {
    formik.initialValues.title = userData.title;
    formik.initialValues.description = userData.description;
    formik.initialValues.summary = userData.summary;
    formik.initialValues.category = userData.category._id;
    formik.initialValues.tags = userData.tags.join(",");
    formik.initialValues.image = userData.image;
  }
  return (
    <>
      <Grid container justifyContent="flex-start" alignItems="center">
        <Button
          variant="text"
          className={classes.returnLink}
          component={RouterLink}
          to="/admin/posts"
          color="primary"
          size="small"
          startIcon={<ArrowBackIcon />}
        >
          Return to Posts
        </Button>
      </Grid>
      <ScreenTitle text="Edit Post" className={classes.root} />
      <Box className={classes.formContent}>
        {(isLoading && !isError) || (isUserDataLoading && !isUserDataError) ? (
          <Grid container alignItems="center" justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          <form onSubmit={formik.handleSubmit}>
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
            <TextField
              fullWidth
              multiline
              minRows={5}
              variant="outlined"
              id="summary"
              name="summary"
              label="Summary"
              value={formik.values.summary}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.summary && Boolean(formik.errors.summary)}
              helperText={
                (formik.touched.summary && formik.errors.summary) || " "
              }
            />
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
              >
                {!isLoading &&
                  !isError &&
                  data.map((cat) => (
                    <MenuItem value={cat._id}>{cat.title}</MenuItem>
                  ))}
              </Select>
              <span className={classes.errorLabel}>
                {(formik.touched.category && formik.errors.category) || " "}
              </span>
            </FormControl>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              id="tags"
              name="tags"
              label="Tags"
              placeholder="Enter tags separated by commas"
              value={formik.values.tags}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tags && Boolean(formik.errors.tags)}
              helperText={(formik.touched.tags && formik.errors.tags) || " "}
            />
            <Box className={classes.inputGroup}>
              <input
                accept="image/*"
                className={classes.input}
                id="image"
                multiple
                type="file"
                onChange={(event) => {
                  formik.setFieldValue("image", event.target.files[0]);
                }}
                onBlur={formik.handleBlur}
                name="image"
              />
              <label htmlFor="image">
                <Button
                  startIcon={<PhotoCameraIcon />}
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  Upload Image
                </Button>
              </label>
              <label className={classes.inputLabel}>
                {formik.values.image.name ? formik.values.image.name : ""}
              </label>
              <span className={classes.errorLabel}>
                {(formik.touched.image && formik.errors.image) || " "}
              </span>
            </Box>

            <ReactQuill
              theme="bubble"
              onChange={(editorData) => {
                formik.setFieldValue("description", editorData);
              }}
              value={formik.values.description}
              id="description"
              placeholder="Description"
              className={classes.editor}
              name="description"
            />
            <span className={classes.errorLabel}>
              {(formik.touched.description && formik.errors.description) || " "}
            </span>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className={classes.submitBtn}
              startIcon={<CreateIcon />}
            >
              Update Post
            </Button>
          </form>
        )}
      </Box>
    </>
  );
};

export default EditPostScreen;

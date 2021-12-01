import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { createPost } from "../../../data/postQueryFunctions";
import ScreenTitle from "../../../components/ScreenTitle";
import {
  CATEGORY_DATA,
  POST_DATA,
} from "../../../definitions/reactQueryConstants/queryConstants";
import { useFormik } from "formik";
import * as yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { getAllCategories } from "../../../data/categoryQueryFunctions";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    minWidth: 240,
    marginBottom: theme.spacing(2.5),
  },
  formContent: {
    padding: `${theme.spacing(4)}px 0px`,
    paddingRight: theme.spacing(4),
  },
  editor: {
    height: "50vh",
    border: "1px solid #ddd",
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    "& .ql-container": {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
    },
  },
  input: {
    display: "none",
  },
  inputGroup: {
    display: "block",
    marginBottom: theme.spacing(2),
  },
  inputLabel: {
    marginLeft: theme.spacing(1),
  },
  errorLabel: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(2),
    fontSize: "0.75rem",
    lineHeight: 1.66,
    letterSpacing: "0.03333em",
    display: "block",
  },
  submitBtn: {
    marginTop: theme.spacing(4),
  },
}));

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

const CreatePostScreen = () => {
  const classes = useStyles();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.userData);
  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  const mutation = useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(POST_DATA);
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
        title: values.title,
        description: values.description,
        summary: values.summary,
        category: values.category,
        tags: values.tags,
        image: values.image,
      });
    },
  });
  return (
    <>
      <ScreenTitle text="Create a new post" className={classes.root} />
      <Box className={classes.formContent}>
        {isLoading && !isError ? (
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
                <Button variant="contained" color="primary" component="span">
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
            >
              Create Post
            </Button>
          </form>
        )}
      </Box>
    </>
  );
};

export default CreatePostScreen;

"use client";

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
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPostById, updatePostById } from "../../../data/postQueryFunctions";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import * as yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dynamic from "next/dynamic";
import ScreenTitle from "../../../components/ScreenTitle";
import "react-quill-new/dist/quill.bubble.css";
import CreateIcon from "@mui/icons-material/Create";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { getAllCategories } from "../../../data/categoryQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
  SINGLE_POST_DATA,
} from "../../../definitions/reactQueryConstants/queryConstants";
import { adminPostEditStyles } from "../../../styles/adminPostStyles";
import { modules } from "../../../definitions/editorModules";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isRehydrated } = useSelector((state) => state.userData);
  const { editPostId } = useParams();
  useEffect(() => {
    if (!isRehydrated) {
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
    }
  }, [isRehydrated, router, user]);
  const {
    isLoading: isUserDataLoading,
    isError: isUserDataError,
    data: userData,
  } = useQuery({
    queryKey: [SINGLE_POST_DATA, editPostId],

    queryFn: ({ queryKey }) =>
      getPostById(queryKey[1])
  });
  const mutation = useMutation({
    mutationFn: updatePostById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POST_DATA] });
      queryClient.invalidateQueries({ queryKey: [SINGLE_POST_DATA] });
      router.push("/admin/posts?edited=1");
    }
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories
  });
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
    formik.initialValues.image = userData.imageFileName;
  }
  return (
    <>
      <Grid container justifyContent="flex-start" alignItems="center">
        <Button
          variant="text"
          className={classes.returnLink}
          component={Link}
          href="/admin/posts"
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
              modules={modules}
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

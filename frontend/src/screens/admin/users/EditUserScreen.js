import {
  Box,
  Button,
  makeStyles,
  TextField,
  CircularProgress,
  Grid,
} from "@material-ui/core";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useFormik } from "formik";
import CreateIcon from "@material-ui/icons/Create";
import * as yup from "yup";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import TwitterIcon from "@material-ui/icons/Twitter";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";

import { getUserById, updateUserById } from "../../../data/userQueryFunctions";
import { SINGLE_USER_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
import { sanitizeSocialURL } from "../../../utils/dataFormat";

const validationSchema = yup.object({
  name: yup.string("Enter you name"),
  email: yup
    .string("Enter you email address")
    .email("Please enter a valid email address"),
  password: yup
    .string("Enter your password")
    .min(8, "Password length must be at least 8 characters"),
  confirmPassword: yup.string("Confirm your password").when("password", {
    is: (val) => val && val.length >= 8,
    then: yup
      .string()
      .oneOf([yup.ref("password")], "Both passwords need to be the same"),
    otherwise: yup.string("Confirm your password"),
  }),
  bio: yup.string("Enter user bio"),
  facebookId: yup.string("Enter user facebook id"),
  linkedinId: yup.string("Enter user linkedin id"),
  twitterId: yup.string("Enter user twitter id"),
  image: yup.mixed(),
});

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    padding: theme.spacing(2),
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
}));

const EditUserScreen = ({
  showSuccessAlertHandler,
  handleModalClose,
  userId,
}) => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { isLoading, isError, data } = useQuery(
    [SINGLE_USER_DATA, userId],
    ({ queryKey }) => getUserById(queryKey[1])
  );
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      facebookId: "",
      linkedinId: "",
      twitterId: "",
      image: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        userId: userId,
        values: {
          name: values.name,
          email: values.email,
          password: values.password,
          bio: values.bio,
          facebookId: sanitizeSocialURL(values.facebookId),
          linkedinId: sanitizeSocialURL(values.linkedinId),
          twitterId: sanitizeSocialURL(values.twitterId),
          image: values.image,
          isAdmin: false,
        },
      });
      handleModalClose();
    },
  });
  if (!isLoading && !isError) {
    formik.initialValues.name = data.name;
    formik.initialValues.email = data.email;
    formik.initialValues.bio = data.bio;
    formik.initialValues.facebookId = data.facebookId;
    formik.initialValues.linkedinId = data.linkedinId;
    formik.initialValues.twitterId = data.twitterId;
  }
  const mutation = useMutation(updateUserById, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
      showSuccessAlertHandler();
    },
  });
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
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={(formik.touched.name && formik.errors.name) || " "}
            size="small"
          />
          <TextField
            fullWidth
            variant="outlined"
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={(formik.touched.email && formik.errors.email) || " "}
            size="small"
          />
          <TextField
            fullWidth
            variant="outlined"
            id="password"
            name="password"
            label="Password"
            onBlur={formik.handleBlur}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={
              (formik.touched.password && formik.errors.password) || " "
            }
            size="small"
            type="password"
          />
          <TextField
            fullWidth
            variant="outlined"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formik.values.confirmPassword}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              (formik.touched.confirmPassword &&
                formik.errors.confirmPassword) ||
              " "
            }
            size="small"
            type="password"
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
                Upload Photo
              </Button>
            </label>
            <label className={classes.inputLabel}>
              {formik.values.image.name ? formik.values.image.name : ""}
            </label>
            <span className={classes.errorLabel}>
              {(formik.touched.image && formik.errors.image) || " "}
            </span>
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            id="bio"
            name="bio"
            label="Bio"
            value={formik.values.bio}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={(formik.touched.bio && formik.errors.bio) || " "}
            size="small"
          />
          <Grid container justifyContent="space-between" spacing={1}>
            <Grid item xs={4}>
              <Grid container>
                <Grid item xs={3}>
                  <FacebookIcon fontSize="large" />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="facebookId"
                    name="facebookId"
                    label="Facebook"
                    value={formik.values.facebookId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.facebookId &&
                      Boolean(formik.errors.facebookId)
                    }
                    helperText={
                      (formik.touched.facebookId && formik.errors.facebookId) ||
                      " "
                    }
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container>
                <Grid item xs={3}>
                  <LinkedInIcon fontSize="large" />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="linkedinId"
                    name="linkedinId"
                    label="Linkedin"
                    value={formik.values.linkedinId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.linkedinId &&
                      Boolean(formik.errors.linkedinId)
                    }
                    helperText={
                      (formik.touched.linkedinId && formik.errors.linkedinId) ||
                      " "
                    }
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container>
                <Grid item xs={3}>
                  <TwitterIcon fontSize="large" />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="twitterId"
                    name="twitterId"
                    label="Twitter"
                    value={formik.values.twitterId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.twitterId &&
                      Boolean(formik.errors.twitterId)
                    }
                    helperText={
                      (formik.touched.twitterId && formik.errors.twitterId) ||
                      " "
                    }
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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

export default EditUserScreen;

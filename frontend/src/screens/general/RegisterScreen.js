// make Box, Button, Grid, Link, makeStyles, TextField, Typography imports from '@material-ui/core' to individual imports

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import TwitterIcon from "@material-ui/icons/Twitter";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import * as yup from "yup";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "react-query";
import RegisterImg from "../../assets/register.svg";
import { createUser } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { useDispatch } from "react-redux";
import { storeUserData } from "../../redux/slices/userDataSlice";
import { sanitizeSocialURL } from "../../utils/dataFormat";
import { useState } from "react";
import AlertNotification from "../../components/AlertNotification";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(0, 2),
  },
  image: {
    width: "100%",
    height: "40vh",
    padding: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1, 0),
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
  alertContainer: {
    paddingRight: theme.spacing(2),
  },
}));

const validationSchema = yup.object({
  name: yup.string("Enter you name").required("This field is required"),
  email: yup
    .string("Enter you email address")
    .required("This field is required")
    .email("Please enter a valid email address"),
  password: yup
    .string("Enter your password")
    .min(8, "Password length must be at least 8 characters")
    .required("This field is required"),
  confirmPassword: yup.string("Confirm your password").when("password", {
    is: (val) => val && val.length >= 8,
    then: yup
      .string()
      .oneOf([yup.ref("password")], "Both passwords need to be the same")
      .required("This field is required"),
    otherwise: yup.string("Confirm your password"),
  }),
  bio: yup.string("Enter your bio").required("This field is required"),
  facebookId: yup.string("Enter your facebook id"),
  linkedinId: yup.string("Enter your linkedin id"),
  twitterId: yup.string("Enter your twitter id"),
  image: yup.mixed(),
});

const RegisterScreen = ({ handleModalClose, openLoginModal }) => {
  // states
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const classes = useStyles();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation(createUser, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(USER_DATA);
      dispatch(storeUserData(data));
      handleModalClose();
    },
    onError: (error) => {
      if (error.status === 400) {
        setErrorMessage("User with this email already exists");
        setShowErrorAlert(true);
      }
    },
  });
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
        name: values.name,
        email: values.email,
        password: values.password,
        bio: values.bio,
        facebookId: sanitizeSocialURL(values.facebookId),
        linkedinId: sanitizeSocialURL(values.linkedinId),
        twitterId: sanitizeSocialURL(values.twitterId),
        image: values.image,
        isAdmin: false,
      });
    },
  });
  return (
    <Box className={classes.container}>
      <Grid
        container
        spacing={3}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={12} sm={6}>
          <img
            className={classes.image}
            src={RegisterImg}
            alt="login prompter img"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" component="h1">
            Sign Up
          </Typography>
          <Box>
            <Box className={classes.alertContainer}>
              <AlertNotification
                alertSeverity="error"
                alertText={errorMessage}
                showState={showErrorAlert}
                closeHandler={() => setShowErrorAlert(false)}
              />
            </Box>
            <form
              onSubmit={formik.handleSubmit}
              className={classes.formContent}
            >
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
                helperText={
                  (formik.touched.email && formik.errors.email) || " "
                }
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
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
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
                <Grid item xs={12} lg={4}>
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
                          (formik.touched.facebookId &&
                            formik.errors.facebookId) ||
                          " "
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} lg={4}>
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
                          (formik.touched.linkedinId &&
                            formik.errors.linkedinId) ||
                          " "
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} lg={4}>
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
                          (formik.touched.twitterId &&
                            formik.errors.twitterId) ||
                          " "
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" component="span">
                Already have an account?{" "}
                <Link
                  href="#"
                  onClick={() => {
                    handleModalClose();
                    setTimeout(() => openLoginModal(), 150);
                  }}
                >
                  Sign In
                </Link>
              </Typography>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterScreen;

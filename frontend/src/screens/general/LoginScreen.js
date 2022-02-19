import {
  Box,
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { useState } from "react";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import LoginImg from "../../assets/login.svg";
import AlertNotification from "../../components/AlertNotification";
import { signInUser } from "../../data/userQueryFunctions";
import { storeUserData } from "../../redux/slices/userDataSlice";

const useStyles = makeStyles((theme) => ({
  image: {
    width: "100%",
    height: "40vh",
    padding: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(4),
  },
  alertContainer: {
    paddingRight: theme.spacing(2),
  },
}));

const validationSchema = yup.object({
  email: yup
    .string("Enter you email address")
    .required("This field is required")
    .email("Please enter a valid email address"),
  password: yup
    .string("Enter your password")
    .required("This field is required"),
});

const LoginScreen = ({ handleModalClose }) => {
  const [showInvalidCredentialsAlert, setShowInvalidCredentialsAlert] =
    useState(false);
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const mutation = useMutation(signInUser, {
    onSuccess: (data) => {
      dispatch(storeUserData(data));
      if (data.isAdmin) {
        history.push("/admin");
      }
      handleModalClose();
    },
    onError: (error) => {
      if (error.status === 401) {
        setShowInvalidCredentialsAlert(true);
      }
    },
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        email: values.email,
        password: values.password,
      });
    },
  });
  return (
    <Grid container spacing={3} justifyContent="space-between">
      <Grid item xs={6}>
        <img
          className={classes.image}
          src={LoginImg}
          alt="login prompter img"
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h5" component="h1">
          Sign In
        </Typography>
        <Box className={classes.alertContainer}>
          <AlertNotification
            alertSeverity="error"
            alertText={"Incorrect email or password"}
            showState={showInvalidCredentialsAlert}
            closeHandler={() => setShowInvalidCredentialsAlert(false)}
          />
        </Box>
        <Box>
          <form onSubmit={formik.handleSubmit} className={classes.formContent}>
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
  );
};

export default LoginScreen;

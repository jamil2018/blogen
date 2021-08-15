import {
  Box,
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import * as yup from "yup";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "react-query";
import RegisterImg from "../../assets/register.svg";
import { createUser } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { useDispatch } from "react-redux";
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
    paddingTop: theme.spacing(2),
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
});

const RegisterScreen = ({ handleModalClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation(createUser, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(USER_DATA);
      dispatch(storeUserData(data));
    },
  });
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
        isAdmin: false,
      });
      handleModalClose();
    },
  });
  return (
    <Grid
      container
      spacing={3}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item xs={6}>
        <img
          className={classes.image}
          src={RegisterImg}
          alt="login prompter img"
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h5" component="h1">
          Sign Up
        </Typography>
        <Box>
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

export default RegisterScreen;

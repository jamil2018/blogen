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

import * as yup from "yup";

import { getUserById, updateUser } from "../../data/userQueryFunctions";
import { SINGLE_USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";

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
});

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
  formContent: {
    padding: theme.spacing(2),
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
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate(userId, {
        name: values.name,
        email: values.email,
        password: values.password,
        isAdmin: false,
      });
      handleModalClose();
    },
  });
  if (!isLoading && !isError) {
    formik.values.name = data.name;
    formik.values.email = data.email;
  }
  const mutation = useMutation(updateUser, {
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
      )}
    </Box>
  );
};

export default EditUserScreen;

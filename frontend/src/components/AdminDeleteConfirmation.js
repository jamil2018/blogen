import { Box, Button, Grid, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
}));

const AdminDeleteConfirmation = ({
  deleteAction,
  cancelAction,
  singleItem = false,
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography variant="body2" className={classes.title}>
        {singleItem
          ? "Are you sure you want to delete the selected item?"
          : "Are you sure you want to delete the selected item(s)?"}
      </Typography>
      <Grid container justifyContent="center" alignItems="center">
        <Button
          onClick={deleteAction}
          className={classes.button}
          variant="contained"
          color="primary"
          startIcon={<DeleteIcon />}
        >
          Yes
        </Button>
        <Button
          onClick={cancelAction}
          className={classes.button}
          variant="outlined"
          color="secondary"
          startIcon={<CancelIcon />}
        >
          No
        </Button>
      </Grid>
    </Box>
  );
};

export default AdminDeleteConfirmation;

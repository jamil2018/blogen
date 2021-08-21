import { Box, Button, Grid, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: `0px ${theme.spacing(2)}px`,
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  button: {
    margin: `0px ${theme.spacing(2)}px`,
  },
}));

const AdminDeleteConfirmation = ({ deleteAction, cancelAction }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography variant="body1" className={classes.title}>
        Are you sure you want to delete the selected item(s)?
      </Typography>
      <Grid container justifyContent="center" alignItems="center">
        <Button
          onClick={deleteAction}
          className={classes.button}
          variant="contained"
          color="primary"
        >
          Yes
        </Button>
        <Button
          onClick={cancelAction}
          className={classes.button}
          variant="outlined"
          color="secondary"
        >
          No
        </Button>
      </Grid>
    </Box>
  );
};

export default AdminDeleteConfirmation;

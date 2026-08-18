import makeStyles from '@mui/styles/makeStyles';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    minWidth: "30vw",
    maxWidth: "50vw",
    minHeight: "28vh",
  },
  modalHeader: {
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(2.5),
  },
  heading: {
    marginLeft: theme.spacing(1),
  },
}));

const AdminModal = ({
  children,
  modalOpenState,
  modalCloseHandler,
  modalTitle,
  modalIcon,
}) => {
  const classes = useStyles();
  return (
    <Modal
      aria-labelledby="Create User Modal"
      aria-describedby="Modal for creating a User"
      open={modalOpenState}
      onClose={modalCloseHandler}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      className={classes.modal}
    >
      <Fade in={modalOpenState}>
        <Paper className={classes.modalContent}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            className={classes.modalHeader}
          >
            {modalIcon}
            <Typography className={classes.heading} variant="h5" component="h1">
              {modalTitle}
            </Typography>
          </Grid>
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
};

export default AdminModal;

import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import Modal from "@material-ui/core/Modal";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    minWidth: "20vw",
    maxWidth: "40vw",
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
            justify="center"
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

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
    minHeight: "30vh",
  },
  modalHeader: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  modalIcon: {
    paddingTop: theme.spacing(2),
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
            className={classes.modalIcon}
            container
            justify="center"
            alignItems="center"
          >
            {modalIcon}
          </Grid>
          <Typography
            variant="h4"
            component="h1"
            className={classes.modalHeader}
            align="center"
          >
            {modalTitle}
          </Typography>
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
};

export default AdminModal;

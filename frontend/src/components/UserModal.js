import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import Modal from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "50vw",
    minHeight: "40vh",
    [theme.breakpoints.down("sm")]: {
      width: "80vw",
      margin: theme.spacing(0, 2),
    },
  },
  modalContentExpanded: {
    width: "70vw",
    minHeight: "40vh",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  closeIcon: {
    padding: theme.spacing(1),
  },
}));

const UserModal = ({ children, open, onClose, expanded = false }) => {
  const classes = useStyles();
  return (
    <Modal
      aria-labelledby="Create User Modal"
      aria-describedby="Modal for creating a User"
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      className={classes.modal}
    >
      <Fade in={open}>
        <Paper
          className={
            expanded ? classes.modalContentExpanded : classes.modalContent
          }
          elevation={0}
        >
          <Grid container justifyContent="flex-end">
            <IconButton aria-label="close" onClick={onClose} size="small">
              <Box className={classes.closeIcon}>
                <CloseIcon fontSize="small" />
              </Box>
            </IconButton>
          </Grid>
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
};

export default UserModal;

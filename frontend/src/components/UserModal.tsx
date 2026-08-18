"use client";

import Grid from "@mui/material/Grid";
import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { ReactNode } from "react";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflowY: "auto",
    maxHeight: "100vh",
  },
  modalContent: {
    width: "50vw",
    minHeight: "40vh",
    [theme.breakpoints.down("md")]: {
      width: "80vw",
      margin: theme.spacing(0, 2),
    },
  },
  modalContentExpanded: {
    width: "70vw",
    minHeight: "40vh",
    [theme.breakpoints.down("md")]: {
      width: "95vw",
    },
  },
  closeIcon: {
    padding: theme.spacing(1),
  },
}));

type UserModalProps = {
  children?: ReactNode;
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
};

const UserModal = ({ children, open, onClose, expanded = false }: UserModalProps) => {
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

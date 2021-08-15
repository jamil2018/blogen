import { Collapse, IconButton, makeStyles } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    maxWidth: "40vw",
    marginLeft: "auto",
    marginRight: "auto",
  },
  animation: {
    zIndex: theme.zIndex.tooltip,
    top: 0,
    left: "50%",
  },
  windowAlert: {
    position: "absolute",
    marginBottom: theme.spacing(2),
  },
}));

const AlertNotification = ({
  showState,
  alertText,
  closeHandler,
  alertSeverity,
  windowAlert,
}) => {
  const classes = useStyles();
  return (
    <Collapse
      in={showState}
      className={
        windowAlert
          ? `${classes.animation} ${classes.windowAlert}`
          : classes.animation
      }
    >
      <Alert
        className={classes.root}
        severity={alertSeverity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={closeHandler}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {alertText}
      </Alert>
    </Collapse>
  );
};

export default AlertNotification;

"use client";

import { Collapse, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Alert, { type AlertColor } from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";

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

type AlertNotificationProps = {
  showState?: boolean;
  alertText?: string;
  closeHandler?: () => void;
  alertSeverity?: AlertColor;
  windowAlert?: boolean;
};

const AlertNotification = ({
  showState,
  alertText,
  closeHandler,
  alertSeverity,
  windowAlert,
}: AlertNotificationProps) => {
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

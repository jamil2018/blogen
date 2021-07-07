import { makeStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import Modal from "@material-ui/core/Modal";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as CreateIcon,
} from "@material-ui/icons";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import { useState } from "react";
import ScreenTitle from "../components/ScreenTitle";
import columns from "../definitions/gridColDef/userGrids";
import { useQuery } from "react-query";
import { getAllUsers } from "../data/userQueryFunctions";
import SignupScreen from "./SignupScreen";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  actionCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: "inherit",
  },
  actionCardContent: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.1),
    "&:last-child": {
      paddingBottom: theme.spacing(0.1),
    },
  },
  divider: {
    margin: theme.spacing(1.5),
  },
  dataGridContainer: {
    height: "80vh",
    width: "100%",
  },
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    minWidth: "20vw",
    maxWidth: "40vw",
    minHeight: "30vh",
    // paddingLeft: theme.spacing(5),
    // paddingRight: theme.spacing(5),
    // paddingBottom: theme.spacing(3),
    // paddingTop: theme.spacing(3),
  },
}));

const AdminUsers = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const classes = useStyles();
  const { isLoading, isError, data, error } = useQuery("users", getAllUsers);
  let rows = [];

  if (!isLoading && !isError && data.length > 0) {
    rows = data.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }));
  }
  const handleModalOpen = (modalType) => {
    switch (modalType) {
      case "CREATE": {
        setShowCreateModal(true);
        break;
      }
      case "DELETE":
        break;
      case "EDIT":
        break;
      default: {
        setShowCreateModal(true);
      }
    }
  };
  const handleModalClose = (modalType) => {
    switch (modalType) {
      case "CREATE": {
        setShowCreateModal(false);
        break;
      }
      case "DELETE":
        break;
      case "EDIT":
        break;
      default: {
        setShowCreateModal(false);
      }
    }
  };
  return (
    <>
      <ScreenTitle text="Users" className={classes.root} />
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Typography variant="body1" component="h1">
            All Users
          </Typography>
        </Grid>
        <Grid item>
          <Card variant="outlined" className={classes.actionCard}>
            <CardContent className={classes.actionCardContent}>
              <Grid container justify="space-around" alignItems="center">
                <IconButton
                  aria-label="create"
                  onClick={() => handleModalOpen("CREATE")}
                >
                  <CreateIcon fontSize="small" />
                </IconButton>
                <Divider
                  className={classes.divider}
                  orientation="vertical"
                  flexItem
                  light
                />
                <IconButton aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
                <Divider
                  className={classes.divider}
                  orientation="vertical"
                  flexItem
                  light
                />
                <IconButton aria-label="delete">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box className={classes.dataGridContainer}>
        <DataGrid
          loading={isLoading}
          checkboxSelection
          columns={columns}
          rows={rows}
          pageSize={12}
          onSelectionModelChange={(e) => setSelectedRows(e.selectionModel)}
          components={{
            Toolbar: GridToolbar,
          }}
          error={error}
        />
      </Box>
      <Modal
        aria-labelledby="Create User Modal"
        aria-describedby="Modal for creating a User"
        open={showCreateModal}
        onClose={() => handleModalClose("CREATE")}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        className={classes.modal}
      >
        <Fade in={showCreateModal}>
          <Paper className={classes.modalContent}>
            <SignupScreen />
          </Paper>
        </Fade>
      </Modal>
    </>
  );
};

export default AdminUsers;

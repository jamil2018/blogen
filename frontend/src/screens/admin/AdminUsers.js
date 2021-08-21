import { makeStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as CreateIcon,
} from "@material-ui/icons";
import ErrorIcon from "@material-ui/icons/Error";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import ScreenTitle from "../../components/ScreenTitle";
import columns from "../../definitions/gridColDef/userGrids";
import { useQuery } from "react-query";
import { getAllUsers } from "../../data/userQueryFunctions";
import SignupScreen from "./SignupScreen";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import AdminModal from "../../components/AdminModal";
import AlertNotification from "../../components/AlertNotification";
import EditUserScreen from "./EditUserScreen";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminUserDeleteScreen from "./AdminUserDeleteScreen";

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
    height: "70vh",
    width: "100%",
  },
}));

const AdminUsers = (props) => {
  const history = useHistory();
  const { user } = useSelector((state) => state.userData);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateSuccessAlert, setShowCreateSuccessAlert] = useState(false);
  const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const classes = useStyles();
  const { isLoading, isError, data, error, isFetching } = useQuery(
    USER_DATA,
    getAllUsers
  );
  let rows = [];
  if (!isLoading && !isError && !isFetching && data.length > 0) {
    rows = data.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }));
  }

  useEffect(() => {
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  useEffect(() => {
    if (selectedRows.length > 0) {
      setEditDisabled(false);
      setDeleteDisabled(false);
    }
    if (selectedRows.length > 1) {
      setEditDisabled(true);
      setDeleteDisabled(false);
    }
    if (selectedRows.length === 0) {
      setEditDisabled(true);
      setDeleteDisabled(true);
    }
  }, [selectedRows, editDisabled, deleteDisabled]);

  const handleModalOpen = (modalType) => {
    switch (modalType) {
      case "CREATE": {
        setShowCreateModal(true);
        break;
      }
      case "DELETE":
        setShowDeleteModal(true);
        break;
      case "EDIT":
        setShowEditModal(true);
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
        setShowDeleteModal(false);
        break;
      case "EDIT":
        setShowEditModal(false);
        break;
      default: {
        setShowCreateModal(false);
      }
    }
  };

  return (
    <>
      <ScreenTitle text="Users" className={classes.root} />
      <AlertNotification
        showState={showCreateSuccessAlert}
        alertText="User has been created"
        closeHandler={() => setShowCreateSuccessAlert(false)}
        alertSeverity="success"
      />
      <AlertNotification
        showState={showEditSuccessAlert}
        alertText="User data has been successfully updated"
        closeHandler={() => setShowEditSuccessAlert(false)}
        alertSeverity="success"
      />
      <AlertNotification
        showState={showDeleteSuccessAlert}
        alertText="The selected user(s) has been deleted"
        closeHandler={() => setShowDeleteSuccessAlert(false)}
        alertSeverity="error"
      />

      <Grid container alignItems="center" justifyContent="space-between">
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
                <IconButton
                  aria-label="edit"
                  disabled={editDisabled}
                  onClick={() => handleModalOpen("EDIT")}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <Divider
                  className={classes.divider}
                  orientation="vertical"
                  flexItem
                  light
                />
                <IconButton
                  aria-label="delete"
                  disabled={deleteDisabled}
                  onClick={() => handleModalOpen("DELETE")}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box className={classes.dataGridContainer}>
        <DataGrid
          loading={isLoading || isFetching}
          checkboxSelection
          columns={columns}
          rows={rows}
          pageSize={12}
          onSelectionModelChange={(e) => setSelectedRows(e.selectionModel)}
          components={{
            Toolbar: GridToolbar,
          }}
          error={error}
          {...props}
        />
      </Box>
      <AdminModal
        modalOpenState={showCreateModal}
        modalCloseHandler={() => handleModalClose("CREATE")}
        modalTitle="Create New User"
        modalIcon={<AccountCircleIcon fontSize="large" color="secondary" />}
      >
        <SignupScreen
          showSuccessAlertHandler={() => setShowCreateSuccessAlert(true)}
          handleModalClose={() => handleModalClose("CREATE")}
        />
      </AdminModal>
      <AdminModal
        modalOpenState={showEditModal}
        modalCloseHandler={() => handleModalClose("EDIT")}
        modalTitle="Edit User"
        modalIcon={<AccountCircleIcon fontSize="large" color="secondary" />}
      >
        <EditUserScreen
          userId={selectedRows[0]}
          showSuccessAlertHandler={() => setShowEditSuccessAlert(true)}
          handleModalClose={() => handleModalClose("EDIT")}
        />
      </AdminModal>
      <AdminModal
        modalOpenState={showDeleteModal}
        modalCloseHandler={() => handleModalClose("DELETE")}
        modalTitle="Confirm Delete"
        modalIcon={<ErrorIcon fontSize="large" color="secondary" />}
      >
        <AdminUserDeleteScreen
          userId={selectedRows}
          showSuccessAlertHandler={() => setShowDeleteSuccessAlert(true)}
          handleModalClose={() => handleModalClose("DELETE")}
        />
      </AdminModal>
    </>
  );
};

export default AdminUsers;

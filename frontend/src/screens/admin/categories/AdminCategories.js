import CreateIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  Box,
  ButtonGroup,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ScreenTitle from "../../../components/ScreenTitle";
import { useQuery } from "react-query";
import { CATEGORY_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
import { getAllCategories } from "../../../data/categoryQueryFunctions";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import columns from "../../../definitions/gridColDef/categoryGrids";
import AdminModal from "../../../components/AdminModal";
import CategoryIcon from "@material-ui/icons/Category";
import ErrorIcon from "@material-ui/icons/Error";
import CreateCategoryScreen from "./CreateCategoryScreen";
import AlertNotification from "../../../components/AlertNotification";
import EditCategoryScreen from "./EditCategoryScreen";
import DeleteCategoryScreen from "./DeleteCategoryScreen";
import { adminCategoryHomeStyles } from "../../../styles/adminCategoryStyles";

const AdminCategories = () => {
  let rows = [];
  const { user } = useSelector((state) => state.userData);
  const classes = adminCategoryHomeStyles();
  const history = useHistory();
  const { data, isLoading, isError, error, isFetching } = useQuery(
    CATEGORY_DATA,
    getAllCategories,
    { refetchOnWindowFocus: false, refetchInterval: 10 * 60 * 1000 }
  );

  // states
  const [selectedRows, setSelectedRows] = useState([]);
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateSuccessAlert, setShowCreateSuccessAlert] = useState(false);
  const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  // effects
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
  }, [selectedRows]);
  useEffect(() => {
    if (isLoading || isFetching) {
      setSelectedRows([]);
    }
  }, [isLoading, isFetching]);

  // modal handlers
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

  if (!isFetching && !isError && !isLoading && data.length > 0) {
    rows = data.map((cat) => ({
      id: cat._id,
      Title: cat.title,
    }));
  }
  return (
    <>
      <ScreenTitle text="Categories" className={classes.root} />
      <AlertNotification
        showState={showCreateSuccessAlert}
        alertText="Category has been created"
        closeHandler={() => setShowCreateSuccessAlert(false)}
        alertSeverity="success"
      />
      <AlertNotification
        showState={showEditSuccessAlert}
        alertText="Category has been updated"
        closeHandler={() => setShowEditSuccessAlert(false)}
        alertSeverity="success"
      />
      <AlertNotification
        showState={showDeleteSuccessAlert}
        alertText="The selected category(s) has been deleted"
        closeHandler={() => setShowDeleteSuccessAlert(false)}
        alertSeverity="error"
      />
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body1" component="h1">
          All Categories
        </Typography>
        <ButtonGroup
          className={classes.buttonGroup}
          color="primary"
          variant="outlined"
          aria-label="admin user action button group"
        >
          <IconButton
            aria-label="create"
            onClick={() => handleModalOpen("CREATE")}
          >
            <CreateIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="edit"
            disabled={editDisabled}
            onClick={() => handleModalOpen("EDIT")}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            disabled={deleteDisabled}
            onClick={() => handleModalOpen("DELETE")}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
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
        />
      </Box>
      {/* modals */}
      <AdminModal
        modalOpenState={showCreateModal}
        modalCloseHandler={() => handleModalClose("CREATE")}
        modalTitle="Create New Category"
        modalIcon={<CategoryIcon fontSize="large" color="secondary" />}
      >
        <CreateCategoryScreen
          showSuccessAlertHandler={() => setShowCreateSuccessAlert(true)}
          handleModalClose={() => handleModalClose("CREATE")}
        />
      </AdminModal>
      <AdminModal
        modalOpenState={showEditModal}
        modalCloseHandler={() => handleModalClose("EDIT")}
        modalTitle="Edit Category"
        modalIcon={<CategoryIcon fontSize="large" color="secondary" />}
      >
        <EditCategoryScreen
          showSuccessAlertHandler={() => setShowEditSuccessAlert(true)}
          categoryId={selectedRows[0]}
          handleModalClose={() => handleModalClose("EDIT")}
        />
      </AdminModal>
      <AdminModal
        modalOpenState={showDeleteModal}
        modalCloseHandler={() => handleModalClose("DELETE")}
        modalTitle="Delete Category"
        modalIcon={<ErrorIcon fontSize="large" color="secondary" />}
      >
        <DeleteCategoryScreen
          categoryId={selectedRows}
          showSuccessAlertHandler={() => setShowDeleteSuccessAlert(true)}
          handleModalClose={() => handleModalClose("DELETE")}
        />
      </AdminModal>
    </>
  );
};

export default AdminCategories;

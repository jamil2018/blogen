import {
  Grid,
  Typography,
  IconButton,
  ButtonGroup,
  Box,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import ScreenTitle from "../../../components/ScreenTitle";
import CreateIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { useQuery } from "react-query";
import columns from "../../../definitions/gridColDef/postGrids";
import { POST_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
import { getAllPostsByAuthorId } from "../../../data/postQueryFunctions";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import AdminModal from "../../../components/AdminModal";
import ErrorIcon from "@material-ui/icons/Error";
import AlertNotification from "../../../components/AlertNotification";
import { adminPostHomeStyles } from "../../../styles/adminPostStyles";
import DeleteUserPostScreen from "./DeleteUserPostScreen";

const UserPosts = () => {
  let rows = [];
  const location = useLocation();
  const classes = adminPostHomeStyles();
  const history = useHistory();
  const { user } = useSelector((state) => state.userData);
  const { data, isLoading, isFetching, isError, error } = useQuery(
    [POST_DATA, user._id],
    ({ queryKey }) => getAllPostsByAuthorId(queryKey[1])
  );
  // states
  const [selectedRows, setSelectedRows] = useState([]);
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateSuccessAlert, setShowCreateSuccessAlert] = useState(false);
  const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);

  // effects
  useEffect(() => {
    if (location.state) {
      if (location.state.showCreateSuccessAlert) {
        setShowCreateSuccessAlert(true);
      }
      if (location.state.showEditSuccessAlert) {
        setShowEditSuccessAlert(true);
      }
    }
  }, [location]);
  useEffect(() => {
    if (user.isAdmin || !user._id) {
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
      case "DELETE":
        setShowDeleteModal(true);
        break;
      default: {
        return;
      }
    }
  };

  const handleModalClose = (modalType) => {
    switch (modalType) {
      case "DELETE":
        setShowDeleteModal(false);
        break;
      default: {
        return;
      }
    }
  };

  if (!isFetching && !isError && !isLoading && data.length > 0) {
    rows = data.map((post) => ({
      id: post._id,
      Title: post.title,
      Author: post.author.name,
      Category: post.category.title,
      Tags: post.tags.join(", "),
    }));
  }
  return (
    <>
      <ScreenTitle text="Posts" className={classes.root} />
      <AlertNotification
        showState={showDeleteSuccessAlert}
        alertText="The selected post(s) has been deleted"
        closeHandler={() => setShowDeleteSuccessAlert(false)}
        alertSeverity="error"
      />
      <AlertNotification
        showState={showCreateSuccessAlert}
        alertText="Post has been created"
        closeHandler={() => setShowCreateSuccessAlert(false)}
        alertSeverity="success"
      />
      <AlertNotification
        showState={showEditSuccessAlert}
        alertText="The selected post has been updated"
        closeHandler={() => setShowEditSuccessAlert(false)}
        alertSeverity="success"
      />
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body1" component="h1">
          All Categories
        </Typography>
        <ButtonGroup
          className={classes.buttonGroup}
          color="primary"
          variant="outlined"
          aria-label="general user action button group"
        >
          <IconButton
            aria-label="create"
            component={Link}
            to="/user/posts/create"
          >
            <CreateIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={editDisabled}
            aria-label="edit"
            component={Link}
            to={`/user/posts/edit/${selectedRows[0]}`}
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
        modalOpenState={showDeleteModal}
        modalCloseHandler={() => handleModalClose("DELETE")}
        modalTitle="Delete Post(s)"
        modalIcon={<ErrorIcon fontSize="large" color="secondary" />}
      >
        <DeleteUserPostScreen
          postId={selectedRows}
          showSuccessAlertHandler={() => setShowDeleteSuccessAlert(true)}
          handleModalClose={() => handleModalClose("DELETE")}
        />
      </AdminModal>
    </>
  );
};

export default UserPosts;

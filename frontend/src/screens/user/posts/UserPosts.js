"use client";

import {
  Grid,
  Typography,
  IconButton,
  ButtonGroup,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ScreenTitle from "../../../components/ScreenTitle";
import CreateIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery } from "@tanstack/react-query";
import columns from "../../../definitions/gridColDef/postGrids";
import { POST_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
import { getAllPostsByAuthorId } from "../../../data/postQueryFunctions";
import { GridToolbar } from "@mui/x-data-grid";
import AdminModal from "../../../components/AdminModal";
import ErrorIcon from "@mui/icons-material/Error";
import AlertNotification from "../../../components/AlertNotification";
import { adminPostHomeStyles } from "../../../styles/adminPostStyles";
import DeleteUserPostScreen from "./DeleteUserPostScreen";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false }
);

const UserPosts = () => {
  let rows = [];
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const classes = adminPostHomeStyles();
  const router = useRouter();
  const { user, isRehydrated } = useSelector((state) => state.userData);
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [POST_DATA, user._id],
    queryFn: ({ queryKey }) => getAllPostsByAuthorId(queryKey[1])
  });
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
    const created = searchParams.get("created") === "1";
    const edited = searchParams.get("edited") === "1";
    if (created) {
      setShowCreateSuccessAlert(true);
    }
    if (edited) {
      setShowEditSuccessAlert(true);
    }
    if (created || edited) {
      router.replace(pathname);
    }
  }, [pathname, router, searchParams]);
  useEffect(() => {
    if (!isRehydrated) {
      return;
    }
    if (user.isAdmin || !user._id) {
      router.push("/");
    }
  }, [isRehydrated, router, user]);
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
          <IconButton aria-label="create" component={Link} href="/user/posts/create" size="large">
            <CreateIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={editDisabled}
            aria-label="edit"
            component={Link}
            href={`/user/posts/edit/${selectedRows[0]}`}
            size="large">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            disabled={deleteDisabled}
            onClick={() => handleModalOpen("DELETE")}
            size="large">
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
          initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
          pageSizeOptions={[12]}
          onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
          slots={{
            toolbar: GridToolbar,
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

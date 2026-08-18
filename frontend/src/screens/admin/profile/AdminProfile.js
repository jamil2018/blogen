"use client";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AdminModal from "../../../components/AdminModal";
import AdminProfileDataRow from "../../../components/AdminProfileDataRow";
import ScreenTitle from "../../../components/ScreenTitle";
import { adminProfileStyles } from "../../../styles/adminProfileStyles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditProfileScreen from "./EditProfileScreen";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { storeUserData } from "../../../redux/slices/userDataSlice";
import AlertNotification from "../../../components/AlertNotification";
import CreateIcon from "@mui/icons-material/Create";
import { useQuery } from "@tanstack/react-query";
import { SINGLE_USER_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
import { getUserById } from "../../../data/userQueryFunctions";
import { getBase64ImageURL } from "../../../utils/imageConvertion";
import { getAuthorNameInitials } from "../../../utils/dataFormat";

const AdminProfile = () => {
  const { user, isRehydrated } = useSelector((state) => state.userData);
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: [SINGLE_USER_DATA, user._id],
    queryFn: ({ queryKey }) => getUserById(queryKey[1])
  });
  const router = useRouter();
  const classes = adminProfileStyles();
  const dispatch = useDispatch();

  // dispatcher
  const updateUserState = (userData) => {
    dispatch(
      storeUserData({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
        token: user.token,
      })
    );
  };

  // states
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // effects
  useEffect(() => {
    if (!isRehydrated) {
      return;
    }
    if (!user.isAdmin || !user._id) {
      router.push("/");
    }
  }, [isRehydrated, router, user]);

  return (
    <>
      <Box className={classes.header}>
        <ScreenTitle text="Profile" className={classes.root} />
        <Typography variant="body1" gutterBottom>
          Welcome admin{" "}
          <Typography component="span" variant="subtitle1" color="primary">
            {user.name}
          </Typography>
        </Typography>
        <AlertNotification
          showState={showAlert}
          alertText="Profile has been updated"
          closeHandler={() => setShowAlert(false)}
          alertSeverity="success"
        />
      </Box>
      {isLoading || isFetching ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : isError ? (
        <Typography variant="body1" gutterBottom>
          Error
        </Typography>
      ) : (
        <>
          {data.imageURL ? (
            <Avatar
              alt="user profile image"
              className={classes.avatar}
              src={data.imageURL}
            />
          ) : (
            <Avatar alt="user profile image" className={classes.avatar}>
              {getAuthorNameInitials(data.name)}
            </Avatar>
          )}

          <AdminProfileDataRow title="Name" value={data.name} />
          <AdminProfileDataRow title="Email" value={data.email} />
          <AdminProfileDataRow title="Bio" value={data.bio} />
          <AdminProfileDataRow title="Facebook URL" value={data.facebookId} />
          <AdminProfileDataRow title="Linkedin URL" value={data.linkedinId} />
          <AdminProfileDataRow title="Twitter URL" value={data.twitterId} />
        </>
      )}

      <AdminProfileDataRow title="Name" value={user.name} />
      <AdminProfileDataRow title="Email" value={user.email} />
      <Button
        variant="contained"
        color="primary"
        startIcon={<CreateIcon />}
        onClick={() => setShowProfileEditModal(true)}
      >
        Edit profile
      </Button>
      <AdminModal
        modalOpenState={showProfileEditModal}
        modalTitle="Edit profile"
        modalCloseHandler={() => setShowProfileEditModal(false)}
        modalIcon={<AccountCircleIcon fontSize="large" color="secondary" />}
      >
        <EditProfileScreen
          handleModalClose={() => setShowProfileEditModal(false)}
          showSuccessAlertHandler={() => setShowAlert(true)}
          dispatcher={(userData) => updateUserState(userData)}
        />
      </AdminModal>
    </>
  );
};

export default AdminProfile;

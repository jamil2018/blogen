import { Box, Button, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import AdminModal from "../../../components/AdminModal";
import AdminProfileDataRow from "../../../components/AdminProfileDataRow";
import ScreenTitle from "../../../components/ScreenTitle";
import { userProfileStyles } from "../../../styles/userProfileStyles";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import EditUserProfileScreen from "./EditUserProfileScreen";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { storeUserData } from "../../../redux/slices/userDataSlice";
import AlertNotification from "../../../components/AlertNotification";
import CreateIcon from "@material-ui/icons/Create";

const UserProfile = () => {
  const { user } = useSelector((state) => state.userData);
  const history = useHistory();
  const classes = userProfileStyles();
  const dispatch = useDispatch();

  // dispatcher
  const updateUserState = (userData) => {
    dispatch(storeUserData({ ...userData, token: user.token }));
  };

  // states
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // effects
  useEffect(() => {
    if (user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);

  return (
    <>
      <Box className={classes.header}>
        <ScreenTitle text="Profile" className={classes.root} />
        <Typography variant="body1" gutterBottom>
          Welcome user
        </Typography>
        <AlertNotification
          showState={showAlert}
          alertText="Profile has been updated"
          closeHandler={() => setShowAlert(false)}
          alertSeverity="success"
        />
      </Box>
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
        <EditUserProfileScreen
          handleModalClose={() => setShowProfileEditModal(false)}
          showSuccessAlertHandler={() => setShowAlert(true)}
          userData={user}
          dispatcher={(userData) => updateUserState(userData)}
        />
      </AdminModal>
    </>
  );
};

export default UserProfile;

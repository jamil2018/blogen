import { Box, Button, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import AdminModal from "../../../components/AdminModal";
import AdminProfileDataRow from "../../../components/AdminProfileDataRow";
import ScreenTitle from "../../../components/ScreenTitle";
import { adminProfileStyles } from "../../../styles/adminProfileStyles";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import EditProfileScreen from "./EditProfileScreen";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { storeUserData } from "../../../redux/slices/userDataSlice";

const AdminProfile = () => {
  const { user } = useSelector((state) => state.userData);
  const history = useHistory();
  const classes = adminProfileStyles();
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
    if (!user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);

  return (
    <>
      <Box className={classes.header}>
        <ScreenTitle text="Profile" className={classes.root} />
        <Typography variant="body1" gutterBottom>
          Welcome admin
        </Typography>
      </Box>
      <AdminProfileDataRow title="Name" value={user.name} />
      <AdminProfileDataRow title="Email" value={user.email} />
      <Button
        variant="contained"
        color="primary"
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
          userData={user}
          dispatcher={(userData) => updateUserState(userData)}
        />
      </AdminModal>
    </>
  );
};

export default AdminProfile;

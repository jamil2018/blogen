import { Button, Typography } from "@material-ui/core";
import { useState } from "react";
import { Link } from "react-router-dom";
import UserModal from "../../components/UserModal";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

const HomeScreen = () => {
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);

  const modalCloseHandler = (modalType) => {
    switch (modalType) {
      case "LOGIN":
        setOpenLoginModal(false);
        break;
      case "REGISTER":
        setOpenRegistrationModal(false);
        break;
      default:
        return;
    }
  };
  return (
    <>
      <Typography variant="h1">Home Screen</Typography>
      <Button
        style={{ marginRight: "2rem" }}
        component={Link}
        to="/admin"
        variant="contained"
      >
        Admin
      </Button>
      <Button
        style={{ marginRight: "2rem" }}
        variant="contained"
        onClick={() => setOpenLoginModal(true)}
      >
        Login
      </Button>
      <Button
        variant="contained"
        onClick={() => setOpenRegistrationModal(true)}
      >
        Register
      </Button>
      <UserModal open={openLoginModal} onClose={() => setOpenLoginModal(false)}>
        <LoginScreen handleModalClose={() => modalCloseHandler("LOGIN")} />
      </UserModal>
      <UserModal
        open={openRegistrationModal}
        onClose={() => setOpenRegistrationModal(false)}
      >
        <RegisterScreen
          handleModalClose={() => modalCloseHandler("REGISTER")}
        />
      </UserModal>
    </>
  );
};

export default HomeScreen;

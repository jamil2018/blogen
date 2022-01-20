import { useState } from "react";
import Navbar from "../components/Navbar";
import NavLink from "../components/NavLink";
import UserModal from "../components/UserModal";
import LoginScreen from "../screens/general/LoginScreen";
import RegisterScreen from "../screens/general/RegisterScreen";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CategoryIcon from "@material-ui/icons/Category";
import PersonIcon from "@material-ui/icons/Person";
import { Container, makeStyles } from "@material-ui/core";
import Footer from "../components/Footer";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "45vh",
  },
}));
const GeneralLayout = ({ children }) => {
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);

  const classes = useStyles();
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
      <Navbar headerText="Blogen">
        <NavLink
          text="categories"
          isLink={true}
          to="/categories"
          variant="text"
          icon={<CategoryIcon />}
        />
        <NavLink
          text="authors"
          isLink={true}
          to="/authors"
          variant="text"
          icon={<PersonIcon />}
        />
        <NavLink
          text="sign in"
          handler={() => setOpenLoginModal(true)}
          icon={<LockOpenIcon />}
          variant="outlined"
          isLink={false}
        />
        <NavLink
          text="register"
          handler={() => setOpenRegistrationModal(true)}
          icon={<PersonAddIcon />}
          variant="contained"
          isLink={false}
        />
      </Navbar>
      <Container maxWidth="xl" className={classes.container}>
        {children}
      </Container>
      {/* Modals */}
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
      <Footer />
    </>
  );
};

export default GeneralLayout;

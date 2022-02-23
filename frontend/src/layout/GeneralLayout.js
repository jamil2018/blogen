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
import { Avatar, Container, makeStyles } from "@material-ui/core";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import ItemMenu from "../components/ItemMenu";
import ItemMenuElement from "../components/ItemMenuElement";
import { getAuthorNameInitials } from "../utils/dataFormat";
import { clearUserData } from "../redux/slices/userDataSlice";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { getBase64ImageURL } from "../utils/imageConvertion";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "45vh",
  },
}));

const GeneralLayout = ({ children }) => {
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const classes = useStyles();

  const handleLogout = () => {
    dispatch(clearUserData());
  };

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
        {user._id ? (
          <ItemMenu
            isIconButton={true}
            menuButtonContent={
              user.image.data ? (
                <>
                  <Avatar
                    src={getBase64ImageURL(user.image.data.data)}
                    alt={user.name}
                  />
                  <ArrowDropDownIcon />
                </>
              ) : (
                <>
                  <Avatar>{getAuthorNameInitials(user.name)}</Avatar>
                  <ArrowDropDownIcon />
                </>
              )
            }
          >
            <ItemMenuElement isLink={true} link="/user/dashboard">
              Dashboard
            </ItemMenuElement>
            <ItemMenuElement isLink={true} link="/user/profile">
              Profile
            </ItemMenuElement>
            <ItemMenuElement actionHandler={handleLogout}>
              Logout
            </ItemMenuElement>
          </ItemMenu>
        ) : (
          <>
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
          </>
        )}
      </Navbar>
      <Container maxWidth="lg" className={classes.container}>
        {children}
      </Container>
      {/* Modals */}
      <UserModal open={openLoginModal} onClose={() => setOpenLoginModal(false)}>
        <LoginScreen handleModalClose={() => modalCloseHandler("LOGIN")} />
      </UserModal>
      <UserModal
        open={openRegistrationModal}
        onClose={() => setOpenRegistrationModal(false)}
        expanded={true}
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

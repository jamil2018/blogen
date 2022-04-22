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
import InfoIcon from "@material-ui/icons/Info";
import {
  Avatar,
  Box,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import ItemMenu from "../components/ItemMenu";
import ItemMenuElement from "../components/ItemMenuElement";
import { getAuthorNameInitials } from "../utils/dataFormat";
import { clearUserData } from "../redux/slices/userDataSlice";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "45vh",
  },
  navbar: {
    display: "block",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  navbarMobile: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
  },
  navLinkContainerMobile: {
    padding: theme.spacing(3, 0),
  },
}));

const GeneralLayout = ({ children }) => {
  const classes = useStyles();
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  // states
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  // action handlers
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
      <Box className={classes.navbar}>
        <Navbar headerText="Blogen">
          <NavLink
            text="about us"
            isLink={true}
            to="/about"
            icon={<InfoIcon />}
            variant="text"
          />
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
                user.imageURL ? (
                  <>
                    <Avatar src={user.imageURL} alt={user.name} />
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
      </Box>
      <Box className={classes.navbarMobile}>
        <Navbar headerText="Blogen">
          <IconButton
            color="primary"
            aria-label="mobile menu"
            component="span"
            onClick={() => setOpenDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="top"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
          >
            <Container maxWidth="lg">
              <Grid
                className={classes.navLinkContainerMobile}
                container
                direction="column"
                alignItems="flex-start"
              >
                <NavLink
                  text="about us"
                  isLink={true}
                  to="/about"
                  icon={<InfoIcon />}
                  variant="text"
                  closeDrawerHandler={() => setOpenDrawer(false)}
                />
                <NavLink
                  text="categories"
                  isLink={true}
                  to="/categories"
                  variant="text"
                  icon={<CategoryIcon />}
                  closeDrawerHandler={() => setOpenDrawer(false)}
                />
                <NavLink
                  text="authors"
                  isLink={true}
                  to="/authors"
                  variant="text"
                  icon={<PersonIcon />}
                  closeDrawerHandler={() => setOpenDrawer(false)}
                />
                {user._id ? (
                  // <ItemMenu
                  //   isIconButton={true}
                  //   menuButtonContent={
                  //     user.imageURL ? (
                  //       <>
                  //         <Avatar src={user.imageURL} alt={user.name} />
                  //         <ArrowDropDownIcon />
                  //       </>
                  //     ) : (
                  //       <>
                  //         <Avatar>{getAuthorNameInitials(user.name)}</Avatar>
                  //         <ArrowDropDownIcon />
                  //       </>
                  //     )
                  //   }
                  // >
                  //   <ItemMenuElement isLink={true} link="/user/dashboard">
                  //     Dashboard
                  //   </ItemMenuElement>
                  //   <ItemMenuElement isLink={true} link="/user/profile">
                  //     Profile
                  //   </ItemMenuElement>
                  //   <ItemMenuElement actionHandler={handleLogout}>
                  //     Logout
                  //   </ItemMenuElement>
                  // </ItemMenu>
                  <>
                    <NavLink
                      text="dashboard"
                      isLink={true}
                      to="/user/dashboard"
                      icon={<InfoIcon />}
                      variant="text"
                      closeDrawerHandler={() => setOpenDrawer(false)}
                    />
                    <NavLink
                      text="write"
                      isLink={true}
                      to="/user/posts"
                      icon={<InfoIcon />}
                      variant="text"
                      closeDrawerHandler={() => setOpenDrawer(false)}
                    />
                    <NavLink
                      text="profile"
                      isLink={true}
                      to="/user/profile"
                      variant="text"
                      icon={<CategoryIcon />}
                      closeDrawerHandler={() => setOpenDrawer(false)}
                    />
                    <NavLink
                      text="logout"
                      handler={handleLogout}
                      icon={<LockOpenIcon />}
                      variant="outlined"
                      isLink={false}
                      closeDrawerHandler={() => setOpenDrawer(false)}
                    />
                  </>
                ) : (
                  <>
                    <Grid container>
                      <NavLink
                        text="sign in"
                        handler={() => setOpenLoginModal(true)}
                        icon={<LockOpenIcon />}
                        variant="outlined"
                        isLink={false}
                        closeDrawerHandler={() => setOpenDrawer(false)}
                      />
                      <NavLink
                        text="register"
                        handler={() => setOpenRegistrationModal(true)}
                        icon={<PersonAddIcon />}
                        variant="contained"
                        isLink={false}
                        closeDrawerHandler={() => setOpenDrawer(false)}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Container>
          </Drawer>
        </Navbar>
      </Box>
      <Container maxWidth="lg" className={classes.container}>
        {children}
      </Container>
      {/* Modals */}
      <UserModal open={openLoginModal} onClose={() => setOpenLoginModal(false)}>
        <LoginScreen
          handleModalClose={() => modalCloseHandler("LOGIN")}
          openRegistrationModal={() => setOpenRegistrationModal(true)}
        />
      </UserModal>
      <UserModal
        open={openRegistrationModal}
        onClose={() => setOpenRegistrationModal(false)}
        expanded={true}
      >
        <RegisterScreen
          openLoginModal={() => setOpenLoginModal(true)}
          handleModalClose={() => modalCloseHandler("REGISTER")}
        />
      </UserModal>
      <Footer />
    </>
  );
};

export default GeneralLayout;

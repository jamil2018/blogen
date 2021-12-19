import React from "react";
import {
  makeStyles,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
} from "@material-ui/core";
import {
  People as PeopleIcon,
  Category as CategoryIcon,
  Note as PostIcon,
} from "@material-ui/icons";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import { Link, NavLink, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../redux/slices/userDataSlice";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  list: {
    marginTop: theme.spacing(2),
  },
  bottomList: {
    marginTop: "auto",
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  drawerHeader: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textDecoration: "none",
    fontWeight: theme.typography.fontWeightMedium,
    letterSpacing: theme.spacing(0.5),
  },
  activeLink: {
    color: theme.palette.primary.main,
  },
}));

const AdminLayout = ({ children }) => {
  const classes = useStyles();
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogout = () => {
    dispatch(clearUserData());
    history.push("/");
  };
  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <Typography
          className={classes.drawerHeader}
          variant="h6"
          component={Link}
          to="/admin"
          color="textPrimary"
          align="center"
        >
          Blogen
        </Typography>
        <Divider />
        <List className={classes.list}>
          <ListItem
            button
            component={NavLink}
            to="/admin/users"
            activeClassName={classes.activeLink}
          >
            <ListItemIcon>
              <PeopleIcon
                color={
                  location.pathname === "/admin/users" ? "primary" : "inherit"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/admin/categories"
            activeClassName={classes.activeLink}
          >
            <ListItemIcon>
              <CategoryIcon
                color={
                  location.pathname === "/admin/categories"
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/admin/posts"
            activeClassName={classes.activeLink}
          >
            <ListItemIcon>
              <PostIcon
                color={
                  location.pathname.includes("/admin/posts")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItem>
        </List>
        <List className={classes.bottomList}>
          <ListItem divider></ListItem>
          <ListItem
            button
            component={NavLink}
            to="/admin/profile"
            activeClassName={classes.activeLink}
          >
            <ListItemIcon>
              <AccountCircleIcon
                color={
                  location.pathname.includes("/admin/profile")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <PowerSettingsNewIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Container maxWidth="lg">{children}</Container>
    </div>
  );
};
export default AdminLayout;

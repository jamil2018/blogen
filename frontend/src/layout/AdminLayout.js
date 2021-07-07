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
import { Link, NavLink, useLocation } from "react-router-dom";

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
                color={location.pathname === "/admin/users" ? "primary" : ""}
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
                  location.pathname === "/admin/categories" ? "primary" : ""
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
                color={location.pathname === "/admin/posts" ? "primary" : ""}
              />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItem>
        </List>
      </Drawer>
      <Container maxWidth="lg">{children}</Container>
    </div>
  );
};
export default AdminLayout;

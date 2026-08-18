"use client";

import React, { type ReactNode } from "react";
import {
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Note as PostIcon } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const UserLayout = ({ children }: { children?: ReactNode }) => {
  const classes = useStyles();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(clearUserData());
    router.push("/");
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
          href="/"
          color="textPrimary"
          align="center"
        >
          Blogen
        </Typography>
        <Divider />
        <List className={classes.list}>
          <ListItem
            button
            component={Link}
            href="/user/dashboard"
            className={pathname.includes("/user/dashboard") ? classes.activeLink : undefined}
          >
            <ListItemIcon>
              <DashboardIcon
                color={
                  pathname.includes("/user/dashboard")
                    ? "primary"
                    : "inherit"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem
            button
            component={Link}
            href="/user/posts"
            className={pathname.includes("/user/posts") ? classes.activeLink : undefined}
          >
            <ListItemIcon>
              <PostIcon
                color={
                  pathname.includes("/user/posts")
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
            component={Link}
            href="/user/profile"
            className={pathname.includes("/user/profile") ? classes.activeLink : undefined}
          >
            <ListItemIcon>
              <AccountCircleIcon
                color={
                  pathname.includes("/user/profile")
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
export default UserLayout;

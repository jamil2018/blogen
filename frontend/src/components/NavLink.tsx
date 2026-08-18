"use client";

import { Button, type ButtonProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Link from "next/link";
import type { ReactNode } from "react";

const useStyles = makeStyles((theme) => ({
  navLink: {
    marginRight: theme.spacing(2),
  },
}));

type NavLinkProps = {
  text: string;
  handler?: () => void;
  icon?: ReactNode;
  variant?: ButtonProps["variant"];
  isLink?: boolean;
  to?: string;
  closeDrawerHandler?: () => void;
};

const NavLink = ({
  text,
  handler,
  icon,
  variant,
  isLink,
  to,
  closeDrawerHandler,
}: NavLinkProps) => {
  const classes = useStyles();

  // action handler
  const handleClick = () => {
    if (closeDrawerHandler) {
      closeDrawerHandler();
    }
    handler?.();
  };
  return isLink ? (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      component={Link}
      href={to ?? "/"}
      {...(closeDrawerHandler && { onClick: closeDrawerHandler })}
    >
      {text}
    </Button>
  ) : (
    <Button
      variant={variant}
      color="primary"
      className={classes.navLink}
      startIcon={icon}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

export default NavLink;

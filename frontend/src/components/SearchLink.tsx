"use client";

import { alpha, Link } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import NextLink from "next/link";
import type { ReactNode } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "block",
    font: "inherit",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    width: "100%",
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      textDecoration: "none",
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    "&:last-child": {
      marginBottom: 0,
    },
  },
}));

type SearchLinkProps = {
  children?: ReactNode;
  to: string;
  onClick?: () => void;
};

const SearchLink = ({ children, to, onClick }: SearchLinkProps) => {
  const classes = useStyles();
  return (
    <Link
      onClick={onClick}
      className={classes.root}
      component={NextLink}
      href={to}
    >
      {children}
    </Link>
  );
};

export default SearchLink;

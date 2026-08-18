"use client";

import { MenuItem } from "@mui/material";
import Link from "next/link";
import type { ReactNode } from "react";

type ItemMenuElementProps = {
  isLink?: boolean;
  children?: ReactNode;
  actionHandler?: () => void;
  link?: string;
};

const ItemMenuElement = ({
  isLink,
  children,
  actionHandler,
  link,
}: ItemMenuElementProps) => {
  return isLink ? (
    <MenuItem component={Link} href={link ?? "/"}>
      {children}
    </MenuItem>
  ) : (
    <MenuItem onClick={actionHandler}>{children}</MenuItem>
  );
};

export default ItemMenuElement;

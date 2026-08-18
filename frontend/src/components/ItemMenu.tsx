"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { Button, IconButton, Menu } from "@mui/material";

type ItemMenuProps = {
  children?: ReactNode;
  isIconButton?: boolean;
  menuButtonContent?: ReactNode;
};

const ItemMenu = ({ children, isIconButton, menuButtonContent }: ItemMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {isIconButton ? (
        <IconButton
          aria-controls="app-menu"
          aria-haspopup="true"
          onClick={handleClick}
          disableRipple
          size="large">
          {menuButtonContent}
        </IconButton>
      ) : (
        <Button
          aria-controls="app-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {menuButtonContent}
        </Button>
      )}
      <Menu
        id="app-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </div>
  );
};

export default ItemMenu;

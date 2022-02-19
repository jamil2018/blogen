import { useState } from "react";
import { Button, IconButton, Menu } from "@material-ui/core";

const ItemMenu = ({ children, isIconButton, menuButtonContent }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
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
        >
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

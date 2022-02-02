import { MenuItem } from "@material-ui/core";
import { Link } from "react-router-dom";

const ItemMenuElement = ({ isLink, children, actionHandler, link }) => {
  return isLink ? (
    <MenuItem component={Link} to={link}>
      {children}
    </MenuItem>
  ) : (
    <MenuItem onClick={actionHandler}>{children}</MenuItem>
  );
};

export default ItemMenuElement;

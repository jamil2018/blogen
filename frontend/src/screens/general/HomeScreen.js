import { Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  return (
    <>
      <Typography variant="h1">Home Screen</Typography>
      <Button component={Link} to="/admin" variant='contained'>
        Admin
      </Button>
    </>
  );
};

export default HomeScreen;

import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  return (
    <>
      <h1>Home</h1>
      <Button component={Link} to="/posts/62012b36d1d39908d0175f80">
        Go to demo post
      </Button>
    </>
  );
};

export default HomeScreen;

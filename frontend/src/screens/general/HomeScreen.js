import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  return (
    <>
      <h1>Home</h1>
      <Button component={Link} to="/posts/61e7abbec6e9792eb0a6c11b">
        Go to demo post
      </Button>
    </>
  );
};

export default HomeScreen;

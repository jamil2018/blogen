import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import AdminHomeScreen from "./screens/AdminHomeScreen";
import HomeScreen from "./screens/HomeScreen";
import theme from "./theme/theme";
import AdminLayout from "./layout/AdminLayout";
import AdminUsers from "./screens/AdminUsers";
import AdminCategories from "./screens/AdminCategories";
import AdminPosts from "./screens/AdminPosts";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Switch>
          <AdminLayout>
            <Route exact path="/admin" component={AdminHomeScreen} />
            <Route exact path="/admin/users" component={AdminUsers} />
            <Route exact path="/admin/categories" component={AdminCategories} />
            <Route exact path="/admin/posts" component={AdminPosts} />
          </AdminLayout>
          <Route path="/" exact component={HomeScreen} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;

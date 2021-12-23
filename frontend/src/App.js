import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { store } from "./redux/store";
import AdminHomeScreen from "./screens/admin/dashboard/AdminHomeScreen";
import HomeScreen from "./screens/general/HomeScreen";
import theme from "./theme/theme";
import AdminLayout from "./layout/AdminLayout";
import AdminUsers from "./screens/admin/users/AdminUsers";
import AdminCategories from "./screens/admin/categories/AdminCategories";
import AdminPosts from "./screens/admin/posts/AdminPosts";
import CreatePostScreen from "./screens/admin/posts/CreatePostScreen";
import EditPostScreen from "./screens/admin/posts/EditPostScreen";
import AdminProfile from "./screens/admin/profile/AdminProfile";
import UserDashboard from "./screens/user/UserDashboard";

const App = () => {
  const client = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Switch>
              <Route exact path="/" component={HomeScreen} />
              <Route path="/user" component={UserDashboard} />

              <AdminLayout>
                <Route exact path="/admin" component={AdminHomeScreen} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/categories" component={AdminCategories} />
                <Route
                  path="/admin/posts/create"
                  component={CreatePostScreen}
                  exact
                />
                <Route
                  path="/admin/posts/edit/:editPostId"
                  component={EditPostScreen}
                />
                <Route path="/admin/posts" component={AdminPosts} exact />
                <Route path="/admin/profile" component={AdminProfile} />
              </AdminLayout>
            </Switch>
          </Router>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

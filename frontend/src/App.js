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
              <AdminLayout>
                <Route exact path="/admin" component={AdminHomeScreen} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/categories" component={AdminCategories} />
                <Route path="/admin/posts" component={AdminPosts} exact />
                <Route
                  path="/admin/posts/create"
                  component={CreatePostScreen}
                  exact
                />
                <Route
                  path="/admin/posts/edit/:editPostId"
                  component={EditPostScreen}
                />
              </AdminLayout>
            </Switch>
          </Router>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

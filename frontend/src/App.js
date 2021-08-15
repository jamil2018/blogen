import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { store } from "./redux/store";
import AdminHomeScreen from "./screens/admin/AdminHomeScreen";
import HomeScreen from "./screens/general/HomeScreen";
import theme from "./theme/theme";
import AdminLayout from "./layout/AdminLayout";
import AdminUsers from "./screens/admin/AdminUsers";
import AdminCategories from "./screens/admin/AdminCategories";
import AdminPosts from "./screens/admin/AdminPosts";

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
                <Route path="/admin/posts" component={AdminPosts} />
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

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import AdminHomeScreen from "./screens/AdminHomeScreen";
import HomeScreen from "./screens/HomeScreen";
import theme from "./theme/theme";
import AdminLayout from "./layout/AdminLayout";
import AdminUsers from "./screens/AdminUsers";
import AdminCategories from "./screens/AdminCategories";
import AdminPosts from "./screens/AdminPosts";

const App = () => {
  const client = new QueryClient();
  return (
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
  );
};

export default App;

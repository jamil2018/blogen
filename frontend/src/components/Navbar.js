import {
  alpha,
  AppBar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  InputBase,
  makeStyles,
  Toolbar,
  Typography,
  CircularProgress,
  Fade,
} from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import AppIcon from "../assets/appIcon.svg";
import SearchIcon from "@material-ui/icons/Search";
import SearchLink from "./SearchLink";
import { debounce } from "lodash";
import { useState } from "react";
import { useQuery } from "react-query";
import { SEARCH_POST_DATA } from "../definitions/reactQueryConstants/queryConstants";
import { searchPosts } from "../data/postQueryFunctions";
import { useDispatch } from "react-redux";
import { storeSearchQuery } from "../redux/slices/searchDataSlice";

const useStyles = makeStyles((theme) => ({
  mobileContainer: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
    },
  },
  headerText: {
    letterSpacing: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightLight,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  headerLink: {
    textDecoration: "none",
  },
  header: {
    padding: theme.spacing(1, 0),
  },
  headerImage: {
    maxWidth: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    marginLeft: theme.spacing(2),
    marginRight: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginRight: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 6, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
  searchResult: {
    position: "absolute",
    width: "100%",
  },
  searchMobile: {
    [theme.breakpoints.down("xs")]: {
      maxWidth: "66.66%",
      flexBasis: "66.66%",
    },
  },
}));

const Navbar = ({ headerText, closeDrawerHandler, children }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  // states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResultWindow, setShowSearchResultWindow] = useState(false);
  const [isHoveringOnSearchResult, setIsHoveringOnSearchResult] =
    useState(false);

  // action handlers
  const manageSearchInput = (e) => {
    setSearchQuery(e?.target?.value);
  };
  const debouncedInput = debounce(manageSearchInput, 200);
  const handleSearchInput = (e) => {
    if (e.target.value === "") {
      setShowSearchResultWindow(false);
    } else {
      setShowSearchResultWindow(true);
    }
    debouncedInput(e);
  };
  const hideSearchResultWindowHandler = () => {
    setShowSearchResultWindow(false);
  };
  const showSearchResultWindowHandler = () => {
    if (searchQuery !== "") {
      setShowSearchResultWindow(true);
    }
  };
  const handleSearchContainerBlur = () => {
    if (isHoveringOnSearchResult === false) {
      setShowSearchResultWindow(false);
    }
  };
  const handleSearchResultRequest = () => {
    history.push(`/search/${searchQuery}`);
    setShowSearchResultWindow(false);
  };
  // data fetch
  const { isLoading, data } = useQuery(
    [SEARCH_POST_DATA, searchQuery],
    ({ queryKey }) => searchPosts(queryKey[1]),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <AppBar
      position="static"
      color="transparent"
      className={classes.header}
      elevation={false}
    >
      <Toolbar>
        <Container maxWidth="lg" className={classes.mobileContainer}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={9} lg={5}>
              <Grid container justifyContent="flex-start" alignItems="center">
                <Grid item xs={1} sm={3}>
                  <Box className={classes.headerLink} component={Link} to="/">
                    <Grid
                      container
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <img
                        className={classes.headerImage}
                        src={AppIcon}
                        alt="App Icon"
                      />
                      <Typography
                        variant="h6"
                        color="primary"
                        className={classes.headerText}
                      >
                        {headerText}
                      </Typography>
                    </Grid>
                  </Box>
                </Grid>
                <Box className={classes.searchMobile}>
                  <Box
                    className={classes.search}
                    onMouseEnter={() => setIsHoveringOnSearchResult(true)}
                    onMouseLeave={() => setIsHoveringOnSearchResult(false)}
                    onBlur={handleSearchContainerBlur}
                  >
                    <Box className={classes.searchIcon}>
                      <SearchIcon />
                    </Box>
                    <InputBase
                      placeholder="Search???"
                      classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                      }}
                      inputProps={{ "aria-label": "search" }}
                      onChange={handleSearchInput}
                      onFocus={showSearchResultWindowHandler}
                      onKeyDown={(e) => {
                        e.key === "Enter" && handleSearchResultRequest();
                      }}
                    />
                    <Fade in={showSearchResultWindow}>
                      <Card className={classes.searchResult}>
                        <CardContent>
                          {isLoading ? (
                            <Grid
                              container
                              justifyContent="center"
                              alignItems="center"
                            >
                              <CircularProgress />
                            </Grid>
                          ) : (
                            <>
                              {data?.map((post) => (
                                <SearchLink
                                  onClick={hideSearchResultWindowHandler}
                                  to={`/posts/${post._id}`}
                                >
                                  {post.title}
                                </SearchLink>
                              ))}
                              {data?.length === 0 && (
                                <Typography variant="subtitle1">
                                  No results found
                                </Typography>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Fade>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container>{children}</Grid>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

"use client";

import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import AlertNotification from "../../../components/AlertNotification";
import ScreenTitle from "../../../components/ScreenTitle";
import { getCuratedCategoryList } from "../../../data/categoryQueryFunctions";
import { getCuratedPostList } from "../../../data/postQueryFunctions";
import { getCuratedUserList } from "../../../data/userQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
  USER_DATA,
} from "../../../definitions/reactQueryConstants/queryConstants";
import { adminHomeStyles } from "../../../styles/adminHomeStyles";
import { formatData } from "../../../utils/dataFormat";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Legend,
  Bar,
} from "recharts";
import { useTheme } from "@mui/styles";

const AdminHomeScreen = () => {
  const classes = adminHomeStyles();
  const router = useRouter();
  const { user, isRehydrated } = useSelector((state) => state.userData);
  const theme = useTheme();

  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [curatedUserData, setCuratedUserData] = useState([]);
  const [curatedPostData, setCuratedPostData] = useState([]);

  const {
    isLoading: isUserDataLoading,
    isError: isUserDataError,
    isFetching: isUserDataFetching,
    data: userData,
  } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getCuratedUserList
  });

  const {
    isLoading: isCategoryDataLoading,
    isError: isCategoryDataError,
    isFetching: isCategoryDataFetching,
    data: categoryData,
  } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getCuratedCategoryList
  });

  const {
    isLoading: isPostDataLoading,
    isError: isPostDataError,
    isFetching: isPostDataFetching,
    data: postData,
  } = useQuery({
    queryKey: [POST_DATA],
    queryFn: getCuratedPostList
  });
  useEffect(() => {
    if (!isUserDataLoading && !isUserDataFetching) {
      setCuratedUserData(formatData(userData, "createdAt"));
    }
    if (!isPostDataLoading && !isPostDataFetching) {
      setCuratedPostData(formatData(postData, "createdAt"));
    }
  }, [
    isUserDataLoading,
    isCategoryDataLoading,
    isPostDataLoading,
    userData,
    categoryData,
    postData,
    isUserDataFetching,
    isCategoryDataFetching,
    isPostDataFetching,
  ]);
  useEffect(() => {
    if (!isRehydrated) {
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
    }
  }, [isRehydrated, router, user]);
  return (
    <>
      <ScreenTitle text="Dashboard" className={classes.root} />
      {isUserDataError || isCategoryDataError || isPostDataError ? (
        <AlertNotification
          showState={showErrorNotification}
          alertText="Error while loading data. Please try again later"
          closeHandler={() => setShowErrorNotification(false)}
          alertSeverity="error"
        />
      ) : (
        <>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={3} className={classes.cardItem}>
              <Card className={classes.card} variant="outlined">
                <CardContent className={classes.cardContent}>
                  <Typography
                    gutterBottom
                    align="center"
                    variant="h5"
                    component="h2"
                  >
                    Posts
                  </Typography>
                  {isPostDataLoading || isPostDataFetching ? (
                    <Grid container justifyContent="center">
                      <CircularProgress size={25} color="primary" />
                    </Grid>
                  ) : (
                    <Typography
                      color="primary"
                      align="center"
                      variant="h6"
                      component="p"
                    >
                      {postData.length}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3} className={classes.cardItem}>
              <Card className={classes.card} variant="outlined">
                <CardContent>
                  <Typography
                    gutterBottom
                    align="center"
                    variant="h5"
                    component="h2"
                  >
                    Users
                  </Typography>
                  {isUserDataLoading || isUserDataFetching ? (
                    <Grid container justifyContent="center">
                      <CircularProgress size={25} color="primary" />
                    </Grid>
                  ) : (
                    <Typography
                      color="primary"
                      align="center"
                      variant="h6"
                      component="p"
                    >
                      {userData.length}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3} className={classes.cardItem}>
              <Card className={classes.card} variant="outlined">
                <CardContent>
                  <Typography
                    gutterBottom
                    align="center"
                    variant="h5"
                    component="h2"
                  >
                    Categories
                  </Typography>
                  {isCategoryDataLoading || isCategoryDataFetching ? (
                    <Grid container justifyContent="center">
                      <CircularProgress size={25} color="primary" />
                    </Grid>
                  ) : (
                    <Typography
                      color="primary"
                      align="center"
                      variant="h6"
                      component="p"
                    >
                      {categoryData.length}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={12} sm={5} className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      gutterBottom
                    >
                      Users added on the last 7 days
                    </Typography>
                    <BarChart
                      width={500}
                      height={200}
                      data={curatedUserData}
                      margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.primary.main} />
                    </BarChart>
                  </CardContent>
                </Card>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} sm={5} className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      gutterBottom
                    >
                      Posts created on the last 7 days
                    </Typography>
                    <BarChart
                      width={500}
                      height={200}
                      data={curatedPostData}
                      margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.primary.main} />
                    </BarChart>
                  </CardContent>
                </Card>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default AdminHomeScreen;

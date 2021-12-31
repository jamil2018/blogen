import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import AlertNotification from "../../../components/AlertNotification";
import ScreenTitle from "../../../components/ScreenTitle";
import { getCuratedPostListByAuthor } from "../../../data/postQueryFunctions";
import { POST_DATA } from "../../../definitions/reactQueryConstants/queryConstants";
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
import { useTheme } from "@material-ui/styles";

const UserDashboard = () => {
  const classes = adminHomeStyles();
  const history = useHistory();
  const { user } = useSelector((state) => state.userData);
  const theme = useTheme();

  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [curatedPostData, setCuratedPostData] = useState([]);

  const {
    isLoading: isPostDataLoading,
    isError: isPostDataError,
    isFetching: isPostDataFetching,
    data: postData,
  } = useQuery(POST_DATA, getCuratedPostListByAuthor);
  useEffect(() => {
    if (!isPostDataLoading && !isPostDataFetching) {
      setCuratedPostData(formatData(postData, "createdAt"));
    }
  }, [isPostDataLoading, postData, isPostDataFetching]);
  useEffect(() => {
    if (user.isAdmin) {
      history.push("/");
    }
  }, [history, user]);
  return (
    <>
      <ScreenTitle text="Dashboard" className={classes.root} />
      {isPostDataError ? (
        <AlertNotification
          showState={showErrorNotification}
          alertText="Error while loading data. Please try again later"
          closeHandler={() => setShowErrorNotification(false)}
          alertSeverity="error"
        />
      ) : (
        <>
          <Grid container alignItems="center" justifyContent="space-between">
            <Card className={classes.card}>
              <CardContent>
                <Typography
                  gutterBottom
                  align="center"
                  variant="h5"
                  component="h2"
                >
                  Posts
                </Typography>
                {isPostDataLoading || isPostDataFetching ? (
                  <Grid container justify="center">
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
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={12} sm={5} className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <Card>
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

export default UserDashboard;

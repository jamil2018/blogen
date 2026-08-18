"use client";

import { Divider, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Alert } from '@mui/material';
import { useQuery } from "@tanstack/react-query";
import AuthorSummaryCardDeck from "../../components/AuthorSummaryCardDeck";
import AuthorSummaryCardLoader from "../../components/AuthorSummaryCardLoader";
import AuthorSummaryCardLoaderDeck from "../../components/AuthorSummaryCardLoaderDeck";
import { getAllUsers } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";

const useStyles = makeStyles((theme) => ({
  emptyListMessage: {
    marginTop: theme.spacing(4),
  },
}));

const AuthorListScreen = (props) => {
  const { authors } = props || {};
  const classes = useStyles();
  const hasAuthors = authors !== undefined;
  const { data: queriedAuthors, isLoading: queriedIsLoading, isError: queriedIsError } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getAllUsers,
    enabled: !hasAuthors,
  });
  const data = hasAuthors ? authors : queriedAuthors;
  const isLoading = hasAuthors ? false : queriedIsLoading;
  const isError = hasAuthors ? false : queriedIsError;

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        All authors
      </Typography>
      <Divider />
      {isLoading ? (
        <Typography variant="h5" component="h2">
          {/* @todo: create skeleton loader */}
          <AuthorSummaryCardLoaderDeck count={6} />
        </Typography>
      ) : isError ? (
        <Typography variant="h6" component="h4" gutterBottom>
          <Alert severity="error">Error occurred while fetching data</Alert>
        </Typography>
      ) : data.length === 0 ? (
        <Typography
          variant="body1"
          component="h2"
          className={classes.emptyListMessage}
        >
          No authors found....
        </Typography>
      ) : (
        <AuthorSummaryCardDeck authorsData={data} />
      )}
    </>
  );
};

export default AuthorListScreen;

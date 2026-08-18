"use client";

import { Box, Divider, Grid, Typography } from "@mui/material";
import { Alert } from '@mui/material';
import { makeStyles } from "@mui/styles";
import { useQuery } from "@tanstack/react-query";
import CategoryLoaderDeck from "../../components/CategoryLoaderDeck";
import HomeCategoriesDeck from "../../components/HomeCategoriesDeck";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";

const useStyles = makeStyles((theme) => ({
  categoriesContainer: {
    marginTop: theme.spacing(2),
  },
}));

const CategoryListScreen = (props) => {
  const { categories } = props || {};
  const classes = useStyles();

  const hasCategories = categories !== undefined;
  const {
    data: queriedAllCategoryData,
    isLoading: queriedAllCategoryDataLoading,
    isFetching: queriedAllCategoryDataFectching,
    isError: queriedAllCategoryDataError,
  } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
    enabled: !hasCategories,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000
  });
  const allCategoryData = hasCategories ? categories : queriedAllCategoryData;
  const allCategoryDataLoading = hasCategories
    ? false
    : queriedAllCategoryDataLoading;
  const allCategoryDataFectching = hasCategories
    ? false
    : queriedAllCategoryDataFectching;
  const allCategoryDataError = hasCategories
    ? false
    : queriedAllCategoryDataError;

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        All categories
      </Typography>
      <Divider />
      <Box className={classes.categoriesContainer}>
        {allCategoryDataLoading || allCategoryDataFectching ? (
          <CategoryLoaderDeck count={8} position="center" />
        ) : allCategoryDataError ? (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="h6" component="h4" gutterBottom>
              <Alert severity="error">Error occurred while fetching data</Alert>
            </Typography>
          </Grid>
        ) : (
          <Grid container justifyContent="center">
            <HomeCategoriesDeck categories={allCategoryData} />
          </Grid>
        )}
      </Box>
    </>
  );
};

export default CategoryListScreen;

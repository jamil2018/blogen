import { Box, Divider, Grid, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { useQuery } from "react-query";
import CategoryLoaderDeck from "../../components/CategoryLoaderDeck";
import HomeCategoriesDeck from "../../components/HomeCategoriesDeck";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";

const useStyles = makeStyles((theme) => ({
  categoriesContainer: {
    marginTop: theme.spacing(2),
  },
}));

const CategoryListScreen = () => {
  const classes = useStyles();

  const {
    data: allCategoryData,
    isLoading: allCategoryDataLoading,
    isFetching: allCategoryDataFectching,
    isError: allCategoryDataError,
  } = useQuery(CATEGORY_DATA, getAllCategories, {
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });

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

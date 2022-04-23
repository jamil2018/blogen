import { Grid } from "@material-ui/core";
import AuthorSummaryCardLoader from "./AuthorSummaryCardLoader";

const AuthorSummaryCardLoaderDeck = ({ count }) => {
  return (
    <Grid container justifyContent="space-between" spacing={2}>
      {Array.from(Array(count).keys()).map((_, index) => (
        <Grid item xs={12} lg={6} key={index}>
          <AuthorSummaryCardLoader />
        </Grid>
      ))}
    </Grid>
  );
};

export default AuthorSummaryCardLoaderDeck;

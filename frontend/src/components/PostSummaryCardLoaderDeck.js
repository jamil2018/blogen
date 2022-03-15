import { Grid } from "@material-ui/core";
import { memo } from "react";
import PostSummaryCardLoader from "./PostSummaryCardLoader";

const PostSummaryCardLoaderDeck = memo(({ count }) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      {Array.from(Array(count).keys()).map((_) => (
        <Grid item xs={4}>
          <PostSummaryCardLoader />
        </Grid>
      ))}
    </Grid>
  );
});

export default PostSummaryCardLoaderDeck;

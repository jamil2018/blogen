import { Box, Grid } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { memo } from "react";
import AuthorSummaryCard from "./AuthorSummaryCard";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(8, 0),
  },
}));

const AuthorSummaryCardDeck = memo(({ authorsData }) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Grid container justifyContent="space-between" spacing={2}>
        {authorsData.map((author) => (
          <Grid item xs={12} lg={6}>
            <AuthorSummaryCard key={author._id} authorData={author} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

export default AuthorSummaryCardDeck;

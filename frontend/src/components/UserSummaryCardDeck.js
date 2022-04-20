import { Grid } from "@material-ui/core";
import { memo } from "react";
import { getBase64ImageURL } from "../utils/imageConvertion";
import UserSummaryCard from "./UserSummaryCard";

const UserSummaryCardDeck = memo(({ users }) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      {users.map((user) => (
        <Grid item xs={4}>
          <UserSummaryCard
            userProfileImageURL={user.imageURL}
            name={user.name}
            bio={user.bio}
            authorId={user._id}
          />
        </Grid>
      ))}
    </Grid>
  );
});

export default UserSummaryCardDeck;

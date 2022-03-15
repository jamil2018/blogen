import { Grid } from "@material-ui/core";
import { memo } from "react";
import PostSummaryCard from "./PostSummaryCard";

const HomeLatestPostsDeck = memo(({ posts }) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      spacing={2}
      alignItems="center"
    >
      {posts.map((post) => (
        <Grid item xs={4}>
          <PostSummaryCard
            key={post.id}
            postId={post._id}
            authorImage={post.author.image.data.data}
            authorName={post.author.name}
            postTitle={post.title}
            publishDate={post.createdAt}
            description={post.description}
          />
        </Grid>
      ))}
    </Grid>
  );
});

export default HomeLatestPostsDeck;

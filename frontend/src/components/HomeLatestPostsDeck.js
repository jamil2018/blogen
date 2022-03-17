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
        <Grid key={post._id} item xs={4}>
          <PostSummaryCard
            postId={post._id}
            authorId={post.author._id}
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

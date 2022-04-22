import { Grid } from "@material-ui/core";
import { memo } from "react";
import PostSummaryCard from "./PostSummaryCard";

const HomeLatestPostsDeck = memo(({ posts }) => {
  return (
    <Grid container justifyContent="flex-start" spacing={2} alignItems="center">
      {posts.map((post) => (
        <Grid key={post._id} item xs={12} sm={3}>
          <PostSummaryCard
            postId={post._id}
            authorId={post.author._id}
            authorImageURL={post.author.imageURL}
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
